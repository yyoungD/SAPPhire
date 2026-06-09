package com.sapphire.domain.recommendation.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class JobRecommendationRow {
    private Long id;
    private String company;
    private String location;
    private String title;
    private String tagsCsv;
    private BigDecimal score;
    private String matchedSkillsCsv;
    private LocalDate deadline;
    private Integer salaryMin;
    private Integer salaryMax;
    private Boolean salaryNegotiable;
}
