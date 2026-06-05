package com.sapphire.domain.resume.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ResumeDetail(
        Long id,
        String title,
        String summary,
        String visibility,
        String visibilityLabel,
        @JsonProperty("isPrimary")
        boolean isPrimary,
        String createdDate,
        String updatedDate,
        int aiScore,
        String originalFileName,
        List<String> tags,
        List<ResumeSkillItem> skills,
        List<ResumeExperienceItem> experiences,
        ResumeAnalysis analysis
) {
}
