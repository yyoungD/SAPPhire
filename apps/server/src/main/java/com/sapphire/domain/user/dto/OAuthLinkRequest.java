package com.sapphire.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OAuthLinkRequest(
        @NotBlank String provider,
        @NotBlank String oauthId,
        @Email @NotBlank String email,
        String profileImageUrl,
        String language
) {
}
