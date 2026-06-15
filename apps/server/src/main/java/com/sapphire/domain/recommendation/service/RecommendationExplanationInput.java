package com.sapphire.domain.recommendation.service;

import java.util.List;

public record RecommendationExplanationInput(
        String key,
        String type,
        String title,
        String subtitle,
        String location,
        int score,
        List<String> matchedSkills
) {
}
