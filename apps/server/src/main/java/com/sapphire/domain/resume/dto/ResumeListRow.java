package com.sapphire.domain.resume.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ResumeListRow {
    private Long id;
    private String title;
    private String summary;
    private String visibility;
    private Boolean isPrimary;
    private LocalDateTime updatedAt;
    private BigDecimal aiScore;
    private String tagsCsv;
    private BigDecimal moduleScore;
    private BigDecimal integrationScore;
    private String aiSummary;
    private String suggestionComments;
}
