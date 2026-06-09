package com.sapphire.domain.recommendation.controller;

import com.sapphire.domain.recommendation.dto.CandidateRecommendationItem;
import com.sapphire.domain.recommendation.dto.JobRecommendationItem;
import com.sapphire.domain.recommendation.service.RecommendationService;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {
    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<JobRecommendationItem>>> recommendJobs(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long resumeId,
            @RequestParam(required = false) Integer limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                recommendationService.recommendJobs(userDetails.getId(), userDetails.getRole(), resumeId, limit)
        ));
    }

    @GetMapping("/candidates")
    public ResponseEntity<ApiResponse<List<CandidateRecommendationItem>>> recommendCandidates(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam Long jobPostId,
            @RequestParam(required = false) Integer limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                recommendationService.recommendCandidates(userDetails.getId(), userDetails.getRole(), jobPostId, limit)
        ));
    }
}
