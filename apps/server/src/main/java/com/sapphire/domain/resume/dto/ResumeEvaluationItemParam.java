package com.sapphire.domain.resume.dto;

import java.math.BigDecimal;

public record ResumeEvaluationItemParam(
        String category,
        BigDecimal score,
        String comment
) {
}
