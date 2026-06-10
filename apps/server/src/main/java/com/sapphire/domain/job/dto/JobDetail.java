package com.sapphire.domain.job.dto;

import java.util.List;

public record JobDetail(
        Long id,
        String company,
        String title,
        String location,
        String status,
        String statusLabel,
        String position,
        String projectType,
        String employmentType,
        String experienceLevel,
        String career,
        String workType,
        String salary,
        Integer salaryMin,
        Integer salaryMax,
        Boolean salaryNegotiable,
        String deadline,
        Integer minCareerYears,
        Integer maxCareerYears,
        String badge,
        Integer viewCount,
        List<String> tags,
        List<String> skills,
        String description,
        String responsibilities,
        String qualifications,
        String preferredQualifications,
        List<JobAttachmentResponse> attachments
) {
}
