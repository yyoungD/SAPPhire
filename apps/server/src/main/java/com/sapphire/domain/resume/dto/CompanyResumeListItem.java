package com.sapphire.domain.resume.dto;

import java.util.List;

public record CompanyResumeListItem(
        Long id,
        String title,
        String summary,
        String applicantName,
        String applicantProfileImageUrl,
        String location,
        Integer careerYears,
        String visibility,
        String visibilityLabel,
        String updatedDate,
        int aiScore,
        List<String> tags
) {
}
