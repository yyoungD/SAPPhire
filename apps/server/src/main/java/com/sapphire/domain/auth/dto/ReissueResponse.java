package com.sapphire.domain.auth.dto;

public record ReissueResponse(
        String accessToken,
        String refreshToken,
        String tokenType
) {
}
