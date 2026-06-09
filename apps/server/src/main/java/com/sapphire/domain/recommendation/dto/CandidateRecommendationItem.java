package com.sapphire.domain.recommendation.dto;

import java.util.List;

public record CandidateRecommendationItem(
        Long userId,
        Long resumeId,
        String name,
        String professionalTitle,
        String location,
        int careerYears,
        String resumeTitle,
        int score,
        List<String> matchedSkills,
        String reason
) {
}
