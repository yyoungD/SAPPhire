package com.sapphire.domain.auth.dto;

public record SignupResponse(
        Long userId,
        String role
) {
}
