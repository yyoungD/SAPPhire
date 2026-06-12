package com.sapphire.domain.job.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class JobPostRow {
    private Long id;
    private String company;
    private String logoUrl;
    private String websiteUrl;
    private String location;
    private String title;
    private String tagsCsv;
    private LocalDate deadline;
    private Integer salaryMin;
    private Integer salaryMax;
    private Boolean salaryNegotiable;
    private LocalDateTime createdAt;
}
