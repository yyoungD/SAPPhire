package com.sapphire.global.security.oauth;

import com.sapphire.domain.auth.domain.RefreshToken;
import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.auth.mapper.RefreshTokenMapper;
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
    private final RefreshTokenMapper refreshTokenMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final OAuthLinkStateStore oauthLinkStateStore;
    private final String frontendOAuthCallbackUrl;

    public OAuth2LoginSuccessHandler(
            UserMapper userMapper,
            RefreshTokenMapper refreshTokenMapper,
            JwtTokenProvider jwtTokenProvider,
            OAuthLinkStateStore oauthLinkStateStore,
            @Value("${app.oauth2.frontend-callback-url:http://localhost:5173/oauth/callback}") String frontendOAuthCallbackUrl
    ) {
        this.userMapper = userMapper;
        this.refreshTokenMapper = refreshTokenMapper;
        this.jwtTokenProvider = jwtTokenProvider;
        this.oauthLinkStateStore = oauthLinkStateStore;
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
        String picture = attribute(oauth2User, "picture");
        String locale = attribute(oauth2User, "locale");

        if (email == null || email.isBlank() || oauthId == null || oauthId.isBlank()) {
            redirectWithError(response, "missing_required_profile");
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();
        String normalizedLocale = normalizedLocale(locale);

        Long linkUserId = oauthLinkStateStore.consumeUserId(request.getParameter("state"));
        if (linkUserId != null) {
            User linkedUser = linkOAuthAccount(linkUserId, provider, oauthId, normalizedEmail, picture, normalizedLocale);
            if (linkedUser == null) {
                redirectWithError(response, "oauth_link_failed");
                return;
            }
            redirectWithTokens(request, response, linkedUser);
            return;
        }

        User connectedAccount = userMapper.findByOAuth(provider, oauthId);
        User user = connectedAccount == null ? null : userMapper.findById(connectedAccount.getId());
        if (user == null) {
            if (userMapper.findByEmail(normalizedEmail) != null) {
                redirectWithLinkRequired(response, provider, oauthId, normalizedEmail, normalizedName(name, email), picture, normalizedLocale);
                return;
            }
            redirectWithSignupRequired(response, provider, oauthId, normalizedEmail, normalizedName(name, email), picture, normalizedLocale);
            return;
        }
        if (!"ACTIVE".equals(user.getStatus())) {
            redirectWithError(response, "inactive_user");
            return;
        }

        user = updateOAuthProfile(user, picture, normalizedLocale);

        redirectWithTokens(request, response, user);
    }

    private void redirectWithTokens(HttpServletRequest request, HttpServletResponse response, User user) throws IOException {
        String accessToken = jwtTokenProvider.createAccessToken(user);
        String refreshToken = jwtTokenProvider.createRefreshToken(user);
        saveRefreshToken(user.getId(), refreshToken);
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPhone(),
                user.getRole(),
                user.getProfileImageUrl(),
                user.getLanguage(),
                user.getOauthProvider()
        );

        String targetUrl = UriComponentsBuilder.fromUriString(frontendOAuthCallbackUrl)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("tokenType", "Bearer")
                .queryParam("userId", userInfo.id())
                .queryParam("email", userInfo.email())
                .queryParam("name", userInfo.name())
                .queryParam("phone", userInfo.phone())
                .queryParam("role", userInfo.role())
                .queryParam("profileImageUrl", userInfo.profileImageUrl())
                .queryParam("language", userInfo.language())
                .queryParam("oauthProvider", userInfo.oauthProvider())
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private User linkOAuthAccount(
            Long userId,
            String provider,
            String oauthId,
            String email,
            String picture,
            String locale
    ) {
        User user = userMapper.findById(userId);
        if (user == null || !"ACTIVE".equals(user.getStatus()) || !email.equals(user.getEmail())) {
            return null;
        }

        User connectedAccount = userMapper.findByOAuth(provider, oauthId);
        if (connectedAccount != null && !connectedAccount.getId().equals(userId)) {
            return null;
        }

        if (!isBlank(user.getOauthProvider()) || !isBlank(user.getOauthId())) {
            boolean sameOAuthAccount = provider.equals(user.getOauthProvider()) && oauthId.equals(user.getOauthId());
            if (!sameOAuthAccount) {
                return null;
            }
        }

        user.setOauthProvider(provider);
        user.setOauthId(oauthId);
        user.setProfileImageUrl(keepExistingWhenBlank(picture, user.getProfileImageUrl()));
        user.setLanguage(keepExistingWhenBlank(locale, user.getLanguage()));
        userMapper.updateOAuthInfo(user);
        return userMapper.findById(userId);
    }

    private User updateOAuthProfile(User user, String picture, String locale) {
        user.setProfileImageUrl(keepExistingWhenBlank(picture, user.getProfileImageUrl()));
        user.setLanguage(keepExistingWhenBlank(locale, user.getLanguage()));
        userMapper.updateOAuthInfo(user);
        return userMapper.findById(user.getId());
    }

    private String keepExistingWhenBlank(String value, String existingValue) {
        return isBlank(value) ? existingValue : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
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

    private void redirectWithSignupRequired(
            HttpServletResponse response,
            String provider,
            String oauthId,
            String email,
            String name,
            String picture,
            String locale
    ) throws IOException {
        String targetUrl = UriComponentsBuilder.fromUriString(frontendOAuthCallbackUrl)
                .queryParam("signupRequired", true)
                .queryParam("provider", provider)
                .queryParam("oauthId", oauthId)
                .queryParam("email", email)
                .queryParam("name", name)
                .queryParam("profileImageUrl", picture)
                .queryParam("language", locale)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUriString();
        response.sendRedirect(targetUrl);
    }

    private void redirectWithLinkRequired(
            HttpServletResponse response,
            String provider,
            String oauthId,
            String email,
            String name,
            String picture,
            String locale
    ) throws IOException {
        String targetUrl = UriComponentsBuilder.fromUriString(frontendOAuthCallbackUrl)
                .queryParam("linkRequired", true)
                .queryParam("provider", provider)
                .queryParam("oauthId", oauthId)
                .queryParam("email", email)
                .queryParam("name", name)
                .queryParam("profileImageUrl", picture)
                .queryParam("language", locale)
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

    private String normalizedLocale(String locale) {
        if (locale == null || locale.isBlank()) {
            return "KO";
        }
        return locale.trim().toUpperCase().replace('-', '_');
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
