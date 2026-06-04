package com.sapphire.domain.application.dto;

public record ApplicationListItem(
        Long id,
        Long jobPostId,
        Long resumeId,
        String jobTitle,
        String companyName,
        String applicantName,
        String resumeTitle,
        String status,
        String statusLabel,
        String appliedAt,
        String updatedAt
) {
}
