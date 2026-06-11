package com.sapphire.domain.job.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CompanyJobPostRow {
    private Long id;
    private String company;
    private String title;
    private String location;
    private String experienceLevel;
    private String status;
    private Integer viewCount;
    private String tagsCsv;
    private String skillsCsv;
    private LocalDateTime createdAt;
}
