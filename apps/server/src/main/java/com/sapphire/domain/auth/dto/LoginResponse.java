package com.sapphire.domain.auth.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        UserInfo user
) {
    public record UserInfo(
            Long id,
            String email,
            String name,
            String phone,
            String role,
            String profileImageUrl,
            String language,
            String oauthProvider
    ) {
    }
}
