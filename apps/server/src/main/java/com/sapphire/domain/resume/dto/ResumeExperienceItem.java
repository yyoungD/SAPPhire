package com.sapphire.domain.resume.dto;

import java.util.List;

public record ResumeExperienceItem(
        Long id,
        String companyName,
        String projectName,
        String position,
        String role,
        String period,
        String industry,
        List<String> descriptions
) {
}
