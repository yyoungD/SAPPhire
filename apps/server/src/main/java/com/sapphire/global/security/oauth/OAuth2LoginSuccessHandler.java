package com.sapphire.global.security.oauth;

import com.sapphire.domain.auth.domain.RefreshToken;
import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.auth.mapper.RefreshTokenMapper;
import com.sapphire.domain.consent.dto.UserConsent;
import com.sapphire.domain.consent.mapper.ConsentMapper;
import com.sapphire.domain.profile.mapper.PersonalProfileMapper;
import com.sapphire.domain.user.dto.User;
import com.sapphire.domain.user.mapper.UserMapper;
import com.sapphire.global.security.jwt.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final UserMapper userMapper;
    private final PersonalProfileMapper personalProfileMapper;
    private final ConsentMapper consentMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final String frontendOAuthCallbackUrl;

    public OAuth2LoginSuccessHandler(
            UserMapper userMapper,
            PersonalProfileMapper personalProfileMapper,
            ConsentMapper consentMapper,
            RefreshTokenMapper refreshTokenMapper,
            JwtTokenProvider jwtTokenProvider,
            @Value("${app.oauth2.frontend-callback-url:http://localhost:5173/oauth/callback}") String frontendOAuthCallbackUrl
    ) {
        this.userMapper = userMapper;
        this.personalProfileMapper = personalProfileMapper;
        this.consentMapper = consentMapper;
        this.refreshTokenMapper = refreshTokenMapper;
        this.jwtTokenProvider = jwtTokenProvider;
        this.frontendOAuthCallbackUrl = frontendOAuthCallbackUrl;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken token)) {
            redirectWithError(response, "invalid_oauth_response");
            return;
        }

        OAuth2User oauth2User = token.getPrincipal();
        String provider = token.getAuthorizedClientRegistrationId().toUpperCase();
        String oauthId = attribute(oauth2User, "sub", "id");
        String email = attribute(oauth2User, "email");
        String name = attribute(oauth2User, "name", "given_name");

        if (email == null || email.isBlank() || oauthId == null || oauthId.isBlank()) {
            redirectWithError(response, "missing_required_profile");
            return;
        }

        User user = findOrCreateUser(provider, oauthId, email.trim().toLowerCase(), normalizedName(name, email));
        if (!"ACTIVE".equals(user.getStatus())) {
            redirectWithError(response, "inactive_user");
            return;
        }

        String accessToken = jwtTokenProvider.createAccessToken(user);
        String refreshToken = jwtTokenProvider.createRefreshToken(user);
        saveRefreshToken(user.getId(), refreshToken);

        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole()
        );

        String targetUrl = UriComponentsBuilder.fromUriString(frontendOAuthCallbackUrl)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("tokenType", "Bearer")
                .queryParam("userId", userInfo.id())
                .queryParam("email", userInfo.email())
                .queryParam("name", userInfo.name())
                .queryParam("role", userInfo.role())
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private User findOrCreateUser(String provider, String oauthId, String email, String name) {
        User existingUser = userMapper.findByEmail(email);
        if (existingUser != null) {
            existingUser.setOauthProvider(provider);
            existingUser.setOauthId(oauthId);
            userMapper.updateOAuthInfo(existingUser);
            return existingUser;
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setRole("PERSONAL");
        user.setOauthProvider(provider);
        user.setOauthId(oauthId);

        userMapper.insertOAuthUser(user);
        personalProfileMapper.insertDefault(user.getId());
        consentMapper.findRequiredTermIds().forEach(termId -> {
            UserConsent consent = new UserConsent();
            consent.setUserId(user.getId());
            consent.setTermId(termId);
            consent.setAgreed(true);
            consentMapper.insertUserConsent(consent);
        });

        return userMapper.findById(user.getId());
    }

    private void saveRefreshToken(Long userId, String refreshTokenValue) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setRefreshToken(refreshTokenValue);
        refreshToken.setExpiresAt(jwtTokenProvider.getRefreshTokenExpiresAt());
        refreshTokenMapper.upsert(refreshToken);
    }

    private void redirectWithError(HttpServletResponse response, String error) throws IOException {
        String targetUrl = UriComponentsBuilder.fromUriString(frontendOAuthCallbackUrl)
                .queryParam("error", error)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUriString();
        response.sendRedirect(targetUrl);
    }

    private String normalizedName(String name, String email) {
        if (name != null && !name.isBlank()) {
            return name.trim();
        }
        return email.substring(0, email.indexOf('@'));
    }

    private String attribute(OAuth2User user, String... keys) {
        for (String key : keys) {
            Object value = user.getAttribute(key);
            if (value != null) {
                return String.valueOf(value);
            }
        }
        return null;
    }
}
