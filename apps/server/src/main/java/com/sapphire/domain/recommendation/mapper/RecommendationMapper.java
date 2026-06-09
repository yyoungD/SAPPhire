package com.sapphire.domain.recommendation.mapper;

import com.sapphire.domain.recommendation.dto.CandidateRecommendationRow;
import com.sapphire.domain.recommendation.dto.JobRecommendationRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RecommendationMapper {
    Long findDefaultResumeId(@Param("userId") Long userId);

    boolean existsMyResume(@Param("userId") Long userId, @Param("resumeId") Long resumeId);

    boolean existsCompanyJob(@Param("userId") Long userId, @Param("jobPostId") Long jobPostId);

    List<JobRecommendationRow> findRecommendedJobs(
            @Param("userId") Long userId,
            @Param("resumeId") Long resumeId,
            @Param("limit") int limit
    );

    List<CandidateRecommendationRow> findRecommendedCandidates(
            @Param("jobPostId") Long jobPostId,
            @Param("limit") int limit
    );
}
