package com.sapphire.domain.application.dto;

import java.util.List;

public record ApplicationDetail(
        Long id,
        Long jobPostId,
        Long resumeId,
        String jobTitle,
        String companyName,
        String applicantName,
        String applicantProfileImageUrl,
        String resumeTitle,
        Long resumeFileId,
        String resumeOriginalFileName,
        String portfolioUrl,
        List<ApplicationAttachment> attachments,
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
