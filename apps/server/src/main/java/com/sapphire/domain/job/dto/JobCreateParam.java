package com.sapphire.domain.job.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class JobCreateParam {
    private Long id;
    private Long companyProfileId;
    private String title;
    private String description;
    private String responsibilities;
    private String qualifications;
    private String preferredQualifications;
    private String employmentType;
    private String experienceLevel;
    private Integer minCareerYears;
    private Integer maxCareerYears;
    private String location;
    private String workType;
    private Integer salaryMin;
    private Integer salaryMax;
    private Boolean salaryNegotiable;
    private LocalDate deadline;
    private String status;
}
