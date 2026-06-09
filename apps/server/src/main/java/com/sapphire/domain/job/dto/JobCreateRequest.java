package com.sapphire.domain.job.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

public record JobCreateRequest(
        @NotBlank(message = "Job title is required.")
        String title,
        String description,
        String responsibilities,
        String qualifications,
        String preferredQualifications,
        String employmentType,
        String experienceLevel,
        Integer minCareerYears,
        Integer maxCareerYears,
        String location,
        String workType,
        Integer salaryMin,
        Integer salaryMax,
        Boolean salaryNegotiable,
        LocalDate deadline,
        String status,
        List<String> tags,
        List<Long> sapSkillIds
) {
}
