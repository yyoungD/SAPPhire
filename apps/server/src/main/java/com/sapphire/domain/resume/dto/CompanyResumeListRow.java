package com.sapphire.domain.resume.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CompanyResumeListRow {
    private Long id;
    private String title;
    private String summary;
    private String applicantName;
    private String applicantProfileImageUrl;
    private String location;
    private Integer careerYears;
    private String visibility;
    private LocalDateTime updatedAt;
    private BigDecimal aiScore;
    private String tagsCsv;
}
