package com.sapphire.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record ReissueRequest(
        @NotBlank(message = "Refresh token은 필수입니다.")
        String refreshToken
) {
}
