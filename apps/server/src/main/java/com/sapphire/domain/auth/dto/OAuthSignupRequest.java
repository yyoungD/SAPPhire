package com.sapphire.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OAuthSignupRequest(
        @NotBlank String provider,
        @NotBlank String oauthId,
        @Email @NotBlank String email,
        @NotBlank String name,
        String profileImageUrl,
        String language
) {
}
