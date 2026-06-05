package com.sapphire.domain.resume.dto;

public record ResumeSkillItem(
        Long id,
        String name,
        String code,
        String skillType,
        String proficiencyLevel,
        String proficiencyLabel,
        int yearsOfExperience,
        boolean primary,
        int score
) {
}
