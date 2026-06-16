package com.sapphire.domain.resume.dto;

import java.util.List;

public record CompanyResumeDetail(
        Long id,
        String title,
        String summary,
        String applicantName,
        Long applicantUserId,
        String applicantEmail,
        String applicantPhone,
        String applicantProfileImageUrl,
        String professionalTitle,
        String profileSummary,
        String location,
        Integer careerYears,
        String desiredSalary,
        String workType,
        String coreCompetencies,
        String visibility,
        String visibilityLabel,
        String createdDate,
        String updatedDate,
        int aiScore,
        Long resumeFileId,
        String originalFileName,
        String portfolioUrl,
        List<String> tags,
        List<ResumeSkillItem> skills,
        List<ResumeExperienceItem> experiences,
        ResumeAnalysis analysis
) {
}
