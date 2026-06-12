package com.sapphire.domain.job.dto;

import jakarta.validation.constraints.NotBlank;

public record JobStatusUpdateRequest(
        @NotBlank String status
) {
}
