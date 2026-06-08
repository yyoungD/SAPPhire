package com.sapphire.domain.positionoffer.dto;

import jakarta.validation.constraints.NotBlank;

public record PositionOfferStatusUpdateRequest(@NotBlank String status) {
}
