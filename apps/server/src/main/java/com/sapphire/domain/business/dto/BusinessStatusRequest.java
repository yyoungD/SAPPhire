package com.sapphire.domain.business.dto;

import jakarta.validation.constraints.NotBlank;

public record BusinessStatusRequest(
        @NotBlank(message = "Business number is required.")
        String businessNumber
) {
}
