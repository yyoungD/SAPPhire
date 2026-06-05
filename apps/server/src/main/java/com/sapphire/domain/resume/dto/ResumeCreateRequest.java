package com.sapphire.domain.resume.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResumeCreateRequest(
        @NotBlank
        @Size(max = 100)
        String title,

        @Size(max = 1000)
        String summary,

        String visibility,

        boolean isPrimary,

        @NotNull
        Long resumeFileId
) {
}
