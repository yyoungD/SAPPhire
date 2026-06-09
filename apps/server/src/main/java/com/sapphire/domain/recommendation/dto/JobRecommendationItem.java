package com.sapphire.domain.recommendation.dto;

import java.util.List;

public record JobRecommendationItem(
        Long id,
        String company,
        String location,
        String title,
        List<String> tags,
        int score,
        List<String> matchedSkills,
        String reason,
        String salary,
        String badge
) {
}
