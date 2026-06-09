package com.sapphire.domain.recommendation.service;

import com.sapphire.domain.recommendation.dto.CandidateRecommendationItem;
import com.sapphire.domain.recommendation.dto.JobRecommendationItem;

import java.util.List;

public interface RecommendationService {
    List<JobRecommendationItem> recommendJobs(Long userId, String role, Long resumeId, Integer limit);

    List<CandidateRecommendationItem> recommendCandidates(Long userId, String role, Long jobPostId, Integer limit);
}
