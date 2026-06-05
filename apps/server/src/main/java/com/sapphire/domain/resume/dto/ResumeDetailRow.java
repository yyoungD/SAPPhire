package com.sapphire.domain.resume.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ResumeDetailRow {
    private Long id;
    private String title;
    private String summary;
    private String visibility;
    private Boolean isPrimary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BigDecimal aiScore;
    private String aiSummary;
    private BigDecimal moduleScore;
    private BigDecimal integrationScore;
    private String suggestionComments;
    private String originalFileName;
}
