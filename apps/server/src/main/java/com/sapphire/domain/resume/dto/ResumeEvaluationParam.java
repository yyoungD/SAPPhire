package com.sapphire.domain.resume.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ResumeEvaluationParam {
    private Long id;
    private Long personalProfileId;
    private Long resumeId;
    private BigDecimal overallScore;
    private String summary;
    private String modelName;
}
