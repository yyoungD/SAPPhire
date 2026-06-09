package com.sapphire.domain.resume.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ResumeSkillCreateRequest(
        @NotNull
        Long sapSkillId,

        String proficiencyLevel,

        @Min(0)
        @Max(50)
        Integer yearsOfExperience,

        boolean isPrimary
) {
}
