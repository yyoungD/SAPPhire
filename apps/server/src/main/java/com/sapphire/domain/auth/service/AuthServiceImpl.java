package com.sapphire.domain.auth.service;

import com.sapphire.domain.auth.domain.RefreshToken;
import com.sapphire.domain.auth.dto.LoginRequest;
import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.auth.dto.ReissueRequest;
import com.sapphire.domain.auth.dto.ReissueResponse;
import com.sapphire.domain.auth.dto.SignupRequest;
import com.sapphire.domain.auth.dto.SignupResponse;
import com.sapphire.domain.auth.mapper.RefreshTokenMapper;
import com.sapphire.domain.consent.dto.UserConsent;
import com.sapphire.domain.consent.mapper.ConsentMapper;
import com.sapphire.domain.profile.mapper.CompanyProfileMapper;
import com.sapphire.domain.profile.mapper.PersonalProfileMapper;
import com.sapphire.domain.user.dto.User;
import com.sapphire.domain.user.mapper.UserMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import com.sapphire.global.security.jwt.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {
    private static final Set<String> ALLOWED_ROLES = Set.of("PERSONAL", "COMPANY");

    private final UserMapper userMapper;
    private final PersonalProfileMapper personalProfileMapper;
    private final CompanyProfileMapper companyProfileMapper;
    private final ConsentMapper consentMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(
            UserMapper userMapper,
            PersonalProfileMapper personalProfileMapper,
            CompanyProfileMapper companyProfileMapper,
            ConsentMapper consentMapper,
            RefreshTokenMapper refreshTokenMapper,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.userMapper = userMapper;
        this.personalProfileMapper = personalProfileMapper;
        this.companyProfileMapper = companyProfileMapper;
        this.consentMapper = consentMapper;
        this.refreshTokenMapper = refreshTokenMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String role = request.role().trim().toUpperCase();
        if (!ALLOWED_ROLES.contains(role)) {
            throw new CustomException(ErrorCode.INVALID_ROLE);
        }

        String email = request.email().trim().toLowerCase();
        if (userMapper.existsByEmail(email)) {
            throw new CustomException(ErrorCode.DUPLICATED_EMAIL);
        }

        validateRequiredTerms(request);
        Map<Long, Boolean> agreements = collectAgreements(request);
        validateExistingTerms(agreements.keySet());

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setName(request.name().trim());
        user.setPhone(request.phone());
        user.setRole(role);

        userMapper.insert(user);

        if ("PERSONAL".equals(role)) {
            personalProfileMapper.insertDefault(user.getId());
        } else {
            companyProfileMapper.insertDefault(user.getId());
        }

        for (Map.Entry<Long, Boolean> consent : agreements.entrySet()) {
            UserConsent userConsent = new UserConsent();
            userConsent.setUserId(user.getId());
            userConsent.setTermId(consent.getKey());
            userConsent.setAgreed(consent.getValue());
            consentMapper.insertUserConsent(userConsent);
        }

        return new SignupResponse(user.getId(), role);
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userMapper.findByEmail(request.email().trim().toLowerCase());
        if (user == null || user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new CustomException(ErrorCode.INVALID_LOGIN);
        }
        validateActiveUser(user);

        String accessToken = jwtTokenProvider.createAccessToken(user);
        String refreshTokenValue = jwtTokenProvider.createRefreshToken(user);
        saveRefreshToken(user.getId(), refreshTokenValue);

        return new LoginResponse(
                accessToken,
                refreshTokenValue,
                "Bearer",
                new LoginResponse.UserInfo(user.getId(), user.getEmail(), user.getName(), user.getRole())
        );
    }

    @Override
    @Transactional
    public void logout(Long userId) {
        refreshTokenMapper.deleteByUserId(userId);
    }

    @Override
    @Transactional
    public ReissueResponse reissue(ReissueRequest request) {
        jwtTokenProvider.parseClaims(request.refreshToken());

        RefreshToken refreshToken = refreshTokenMapper.findByRefreshToken(request.refreshToken());
        if (refreshToken == null) {
            throw new CustomException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
        }
        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenMapper.deleteByRefreshToken(request.refreshToken());
            throw new CustomException(ErrorCode.EXPIRED_TOKEN);
        }

        User user = userMapper.findById(refreshToken.getUserId());
        if (user == null) {
            refreshTokenMapper.deleteByRefreshToken(request.refreshToken());
            throw new CustomException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
        }
        validateActiveUser(user);

        String newAccessToken = jwtTokenProvider.createAccessToken(user);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(user);
        saveRefreshToken(user.getId(), newRefreshToken);

        return new ReissueResponse(newAccessToken, newRefreshToken, "Bearer");
    }

    private void validateRequiredTerms(SignupRequest request) {
        Map<Long, Boolean> agreements = collectAgreements(request);

        boolean requiredTermMissing = consentMapper.findRequiredTermIds()
                .stream()
                .anyMatch(termId -> !Boolean.TRUE.equals(agreements.get(termId)));

        if (requiredTermMissing) {
            throw new CustomException(ErrorCode.REQUIRED_TERM_NOT_AGREED);
        }
    }

    private void validateExistingTerms(Set<Long> termIds) {
        if (consentMapper.countActiveTermsByIds(termIds) != termIds.size()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "존재하지 않거나 비활성화된 약관이 포함되어 있습니다.");
        }
    }

    private Map<Long, Boolean> collectAgreements(SignupRequest request) {
        return request.consents()
                .stream()
                .collect(Collectors.toMap(
                        SignupRequest.ConsentAgreement::termId,
                        consent -> Boolean.TRUE.equals(consent.agreed()),
                        (left, right) -> left || right
                ));
    }

    private void validateActiveUser(User user) {
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new CustomException(ErrorCode.INACTIVE_USER);
        }
    }

    private void saveRefreshToken(Long userId, String refreshTokenValue) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setRefreshToken(refreshTokenValue);
        refreshToken.setExpiresAt(jwtTokenProvider.getRefreshTokenExpiresAt());
        refreshTokenMapper.upsert(refreshToken);
    }
}
