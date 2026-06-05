package com.sapphire.domain.resume.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ResumeExperienceRow {
    private Long id;
    private String companyName;
    private String projectName;
    private String position;
    private String role;
    private String projectType;
    private String industry;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean current;
    private String description;
}
