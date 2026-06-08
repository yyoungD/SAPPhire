package com.sapphire.domain.positionoffer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record PositionOfferCreateRequest(
        @NotNull Long receiverUserId,
        Long resumeId,
        @NotBlank @Size(max = 150) String title,
        @Size(max = 4000) String message,
        LocalDateTime expiresAt
) {
}
