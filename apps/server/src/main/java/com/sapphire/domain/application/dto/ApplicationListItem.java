package com.sapphire.domain.application.dto;

public record ApplicationListItem(
        Long id,
        Long jobPostId,
        Long resumeId,
        String jobTitle,
        String jobPosition,
        String companyName,
        String applicantName,
        String resumeTitle,
        Integer careerYears,
        String status,
        String statusLabel,
        String appliedAt,
        String updatedAt
) {
}
