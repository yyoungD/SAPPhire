package com.sapphire.domain.auth.service;

import com.sapphire.domain.auth.domain.RefreshToken;
import com.sapphire.domain.auth.dto.AdminLoginRequest;
import com.sapphire.domain.auth.dto.LoginRequest;
import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.auth.dto.OAuthSignupRequest;
import com.sapphire.domain.auth.dto.ReissueRequest;
import com.sapphire.domain.auth.dto.ReissueResponse;
import com.sapphire.domain.auth.dto.SignupRequest;
import com.sapphire.domain.auth.dto.SignupResponse;
import com.sapphire.domain.auth.mapper.RefreshTokenMapper;
import com.sapphire.domain.consent.dto.UserConsent;
import com.sapphire.domain.consent.mapper.ConsentMapper;
import com.sapphire.domain.file.dto.FileRecord;
import com.sapphire.domain.profile.mapper.CompanyProfileMapper;
import com.sapphire.domain.profile.mapper.PersonalProfileMapper;
import com.sapphire.domain.user.dto.User;
import com.sapphire.domain.user.mapper.UserMapper;
import com.sapphire.domain.user.service.ProfileImageStorageService;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import com.sapphire.global.security.jwt.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final Set<String> ALLOWED_ROLES = Set.of("PERSONAL", "COMPANY");

    private final UserMapper userMapper;
    private final PersonalProfileMapper personalProfileMapper;
    private final CompanyProfileMapper companyProfileMapper;
    private final ConsentMapper consentMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ProfileImageStorageService profileImageStorageService;

    public AuthServiceImpl(
            UserMapper userMapper,
            PersonalProfileMapper personalProfileMapper,
            CompanyProfileMapper companyProfileMapper,
            ConsentMapper consentMapper,
            RefreshTokenMapper refreshTokenMapper,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            ProfileImageStorageService profileImageStorageService
    ) {
        this.userMapper = userMapper;
        this.personalProfileMapper = personalProfileMapper;
        this.companyProfileMapper = companyProfileMapper;
        this.consentMapper = consentMapper;
        this.refreshTokenMapper = refreshTokenMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.profileImageStorageService = profileImageStorageService;
    }

    @Override
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String role = request.role().trim().toUpperCase();
        String email = request.email().trim().toLowerCase();
        log.debug("회원가입 요청 시작. email={}, role={}", email, role);

        if (!ALLOWED_ROLES.contains(role)) {
            log.warn("회원가입 실패: 허용되지 않은 역할입니다. email={}, role={}", email, role);
            throw new CustomException(ErrorCode.INVALID_ROLE);
        }
        validateCompanySignup(role, request.companyName(), request.businessNumber(), request.businessNumberVerified());

        if (userMapper.existsByEmail(email)) {
            log.warn("회원가입 실패: 이미 가입된 이메일입니다. email={}", email);
            throw new CustomException(ErrorCode.DUPLICATED_EMAIL);
        }

        log.debug("회원가입 검증 시작. email={}, consentCount={}", email, request.consents().size());
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
        log.debug("사용자 저장 완료. userId={}, email={}, role={}", user.getId(), email, role);

        if ("PERSONAL".equals(role)) {
            personalProfileMapper.insertDefault(user.getId());
            log.debug("개인 기본 프로필 저장 완료. userId={}", user.getId());
        } else {
            companyProfileMapper.insertDefault(user.getId());
            log.debug("기업 기본 프로필 저장 완료. userId={}", user.getId());
        }

        for (Map.Entry<Long, Boolean> consent : agreements.entrySet()) {
            UserConsent userConsent = new UserConsent();
            userConsent.setUserId(user.getId());
            userConsent.setTermId(consent.getKey());
            userConsent.setAgreed(consent.getValue());
            consentMapper.insertUserConsent(userConsent);
        }
        log.info("회원가입 성공. userId={}, email={}, role={}", user.getId(), email, role);

        return new SignupResponse(user.getId(), role);
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        log.debug("로그인 요청 시작. email={}", email);

        User user = userMapper.findByEmail(email);
        return authenticate(user, request.password(), false);
    }

    @Override
    @Transactional
    public LoginResponse adminLogin(AdminLoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userMapper.findByEmail(email);
        return authenticate(user, request.password(), true);
    }

    private LoginResponse authenticate(User user, String password, boolean adminOnly) {
        if (user == null || user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new CustomException(ErrorCode.INVALID_LOGIN);
        }
        if (adminOnly && !"ADMIN".equals(user.getRole())) {
            throw new CustomException(ErrorCode.INVALID_LOGIN);
        }
        validateActiveUser(user);

        String accessToken = jwtTokenProvider.createAccessToken(user);
        String refreshTokenValue = jwtTokenProvider.createRefreshToken(user);
        saveRefreshToken(user.getId(), refreshTokenValue);
        log.info("Login success. userId={}, email={}, role={}", user.getId(), user.getEmail(), user.getRole());

        return new LoginResponse(
                accessToken,
                refreshTokenValue,
                "Bearer",
                toUserInfo(user)
        );
    }

    @Override
    @Transactional
    public LoginResponse oauthSignup(OAuthSignupRequest request) {
        String email = request.email().trim().toLowerCase();

        User user = new User();
        user.setEmail(email);
        user.setName(request.name().trim());
        user.setRole("PERSONAL");
        user.setOauthProvider(request.provider().trim().toUpperCase());
        user.setOauthId(request.oauthId().trim());
        user.setLanguage(normalizedLanguage(request.language()));

        User existingOAuthUser = userMapper.findByOAuth(user.getOauthProvider(), user.getOauthId());
        if (existingOAuthUser != null) {
            throw new CustomException(ErrorCode.DUPLICATED_EMAIL, "This social account is already registered.");
        }

        User existingUser = userMapper.findByEmailIncludingDeleted(email);
        if (existingUser != null) {
            throw new CustomException(ErrorCode.DUPLICATED_EMAIL);
        } else {
            userMapper.insertOAuthUser(user);
            personalProfileMapper.insertDefault(user.getId());
            FileRecord profileImage = profileImageStorageService.storeRemoteImage(user.getId(), request.profileImageUrl());
            if (profileImage != null) {
                user.setProfileImageFileId(profileImage.getId());
                user.setProfileImageUrl(profileImage.getFileUrl());
                userMapper.updateOAuthInfo(user);
            }

            consentMapper.findRequiredTermIds().forEach(termId -> {
                UserConsent consent = new UserConsent();
                consent.setUserId(user.getId());
                consent.setTermId(termId);
                consent.setAgreed(true);
                consentMapper.insertUserConsent(consent);
            });
        }

        User savedUser = userMapper.findById(user.getId());
        String accessToken = jwtTokenProvider.createAccessToken(savedUser);
        String refreshTokenValue = jwtTokenProvider.createRefreshToken(savedUser);
        saveRefreshToken(savedUser.getId(), refreshTokenValue);

        return new LoginResponse(accessToken, refreshTokenValue, "Bearer", toUserInfo(savedUser));
    }

    @Override
    @Transactional
    public void logout(Long userId) {
        refreshTokenMapper.deleteByUserId(userId);
        log.info("로그아웃 성공. userId={}", userId);
    }

    @Override
    @Transactional
    public ReissueResponse reissue(ReissueRequest request) {
        log.debug("토큰 재발급 요청 시작.");
        jwtTokenProvider.parseClaims(request.refreshToken());

        RefreshToken refreshToken = refreshTokenMapper.findByRefreshToken(request.refreshToken());
        if (refreshToken == null) {
            log.warn("토큰 재발급 실패: refresh token을 찾을 수 없습니다.");
            throw new CustomException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
        }
        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenMapper.deleteByRefreshToken(request.refreshToken());
            log.warn("토큰 재발급 실패: refresh token이 만료되었습니다. userId={}", refreshToken.getUserId());
            throw new CustomException(ErrorCode.EXPIRED_TOKEN);
        }

        User user = userMapper.findById(refreshToken.getUserId());
        if (user == null) {
            refreshTokenMapper.deleteByRefreshToken(request.refreshToken());
            log.warn("토큰 재발급 실패: 사용자를 찾을 수 없습니다. userId={}", refreshToken.getUserId());
            throw new CustomException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
        }
        validateActiveUser(user);

        String newAccessToken = jwtTokenProvider.createAccessToken(user);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(user);
        saveRefreshToken(user.getId(), newRefreshToken);
        log.info("토큰 재발급 성공. userId={}, email={}", user.getId(), user.getEmail());

        return new ReissueResponse(newAccessToken, newRefreshToken, "Bearer");
    }

    private void validateRequiredTerms(SignupRequest request) {
        Map<Long, Boolean> agreements = collectAgreements(request);

        boolean requiredTermMissing = consentMapper.findRequiredTermIds()
                .stream()
                .anyMatch(termId -> !Boolean.TRUE.equals(agreements.get(termId)));

        if (requiredTermMissing) {
            log.warn("회원가입 실패: 필수 약관에 동의하지 않았습니다. email={}", request.email().trim().toLowerCase());
            throw new CustomException(ErrorCode.REQUIRED_TERM_NOT_AGREED);
        }
    }

    private void validateExistingTerms(Set<Long> termIds) {
        if (consentMapper.countActiveTermsByIds(termIds) != termIds.size()) {
            log.warn("회원가입 실패: 존재하지 않거나 비활성화된 약관 ID가 포함되어 있습니다. termIds={}", termIds);
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
            log.warn("인증 실패: 비활성 사용자입니다. userId={}, email={}, status={}", user.getId(), user.getEmail(), user.getStatus());
            throw new CustomException(ErrorCode.INACTIVE_USER);
        }
    }

    private void saveRefreshToken(Long userId, String refreshTokenValue) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setRefreshToken(refreshTokenValue);
        refreshToken.setExpiresAt(jwtTokenProvider.getRefreshTokenExpiresAt());
        refreshTokenMapper.upsert(refreshToken);
        log.debug("Refresh token 저장 완료. userId={}, expiresAt={}", userId, refreshToken.getExpiresAt());
    }

    private LoginResponse.UserInfo toUserInfo(User user) {
        return new LoginResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPhone(),
                user.getRole(),
                user.getProfileImageUrl(),
                user.getLanguage(),
                user.getOauthProvider()
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizedLanguage(String language) {
        if (language == null || language.isBlank()) {
            return "KO";
        }
        return language.trim().toUpperCase().replace('-', '_');
    }

    private void validateCompanySignup(String role, String companyName, String businessNumber, Boolean businessNumberVerified) {
        if (!"COMPANY".equals(role)) {
            return;
        }
        if (companyName == null || companyName.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "회사 이름은 필수입니다.");
        }
        if (normalizeBusinessNumber(businessNumber).length() != 10) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "잘못된 사업자 등록 번호입니다. 사업자 등록 번호는 숫자 10자리여야 합니다.");
        }
        if (!Boolean.TRUE.equals(businessNumberVerified)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "사업자 등록 번호 인증이 필요합니다.");
        }
    }

    private String normalizeBusinessNumber(String businessNumber) {
        return businessNumber == null ? "" : businessNumber.replaceAll("[^0-9]", "");
    }
}
