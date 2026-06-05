package com.sapphire.domain.resume.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ResumeListItem(
        Long id,
        String title,
        String summary,
        String visibility,
        String visibilityLabel,
        @JsonProperty("isPrimary")
        boolean isPrimary,
        String updatedDate,
        int aiScore,
        List<String> tags,
        ResumeAnalysis analysis
) {
}
