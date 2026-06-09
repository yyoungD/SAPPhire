package com.sapphire.domain.recommendation.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CandidateRecommendationRow {
    private Long userId;
    private Long resumeId;
    private String name;
    private String professionalTitle;
    private String location;
    private Integer careerYears;
    private String resumeTitle;
    private BigDecimal score;
    private String matchedSkillsCsv;
}
