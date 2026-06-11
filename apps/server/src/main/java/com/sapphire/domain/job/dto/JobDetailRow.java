package com.sapphire.domain.job.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class JobDetailRow {
    private Long id;
    private String company;
    private String title;
    private String location;
    private String employmentType;
    private String experienceLevel;
    private String status;
    private Integer minCareerYears;
    private Integer maxCareerYears;
    private String workType;
    private Integer salaryMin;
    private Integer salaryMax;
    private Boolean salaryNegotiable;
    private LocalDate deadline;
    private Integer viewCount;
    private String tagsCsv;
    private String skillsCsv;
    private String description;
    private String responsibilities;
    private String qualifications;
    private String preferredQualifications;
}
