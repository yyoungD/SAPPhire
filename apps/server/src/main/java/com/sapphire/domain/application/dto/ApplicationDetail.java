package com.sapphire.domain.application.dto;

public record ApplicationDetail(
        Long id,
        Long jobPostId,
        Long resumeId,
        String jobTitle,
        String companyName,
        String applicantName,
        String resumeTitle,
        Long resumeFileId,
        String resumeOriginalFileName,
        String status,
        String statusLabel,
        String appliedAt,
        String updatedAt,
        String coverLetter,
        String jobLocation,
        String employmentType,
        String workType
) {
}
