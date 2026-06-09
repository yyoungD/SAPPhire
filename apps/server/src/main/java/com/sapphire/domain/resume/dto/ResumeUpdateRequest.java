package com.sapphire.domain.resume.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ResumeUpdateRequest(
        @NotBlank
        @Size(max = 100)
        String title,

        @Size(max = 1000)
        String summary,

        String visibility,

        boolean isPrimary,

        List<ResumeSkillCreateRequest> skills
) {
}
