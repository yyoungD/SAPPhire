package com.sapphire.domain.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ApplicationCreateRequest(
        @NotNull Long jobPostId,
        @NotNull Long resumeId,
        @Size(max = 5000) String coverLetter,
        String desiredSalary,
        String availableDate,
        List<Long> attachmentFileIds
) {
}
