package com.sapphire.domain.recommendation.service;

import java.util.List;
import java.util.Map;

public interface AiRecommendationExplanationService {
    Map<String, String> explain(List<RecommendationExplanationInput> recommendations);
}
