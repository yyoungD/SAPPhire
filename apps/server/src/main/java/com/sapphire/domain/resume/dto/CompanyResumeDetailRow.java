package com.sapphire.domain.resume.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CompanyResumeDetailRow {
    private Long id;
    private String title;
    private String summary;
    private String applicantName;
    private Long applicantUserId;
    private String applicantEmail;
    private String applicantPhone;
    private String applicantProfileImageUrl;
    private String professionalTitle;
    private String profileSummary;
    private String location;
    private Integer careerYears;
    private String desiredSalary;
    private String workType;
    private String coreCompetencies;
    private String visibility;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BigDecimal aiScore;
    private String aiSummary;
    private BigDecimal moduleScore;
    private BigDecimal integrationScore;
    private String suggestionComments;
    private Long resumeFileId;
    private String originalFileName;
    private String portfolioUrl;
}
