package com.sapphire.domain.recommendation.service;

import com.sapphire.domain.recommendation.dto.CandidateRecommendationItem;
import com.sapphire.domain.recommendation.dto.CandidateRecommendationRow;
import com.sapphire.domain.recommendation.dto.JobRecommendationItem;
import com.sapphire.domain.recommendation.dto.JobRecommendationRow;
import com.sapphire.domain.recommendation.mapper.RecommendationMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Service
public class RecommendationServiceImpl implements RecommendationService {
    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 50;

    private final RecommendationMapper recommendationMapper;

    public RecommendationServiceImpl(RecommendationMapper recommendationMapper) {
        this.recommendationMapper = recommendationMapper;
    }

    @Override
    public List<JobRecommendationItem> recommendJobs(Long userId, String role, Long resumeId, Integer limit) {
        if (!"PERSONAL".equals(role)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED, "개인 회원만 공고 추천을 조회할 수 있습니다.");
        }

        Long targetResumeId = resumeId == null ? recommendationMapper.findDefaultResumeId(userId) : resumeId;
        if (targetResumeId == null || !recommendationMapper.existsMyResume(userId, targetResumeId)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "추천에 사용할 이력서를 찾을 수 없습니다.");
        }

        return recommendationMapper.findRecommendedJobs(userId, targetResumeId, normalizeLimit(limit))
                .stream()
                .map(this::toJobItem)
                .toList();
    }

    @Override
    public List<CandidateRecommendationItem> recommendCandidates(Long userId, String role, Long jobPostId, Integer limit) {
        if (!"COMPANY".equals(role)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED, "기업 회원만 후보자 추천을 조회할 수 있습니다.");
        }
        if (jobPostId == null || !recommendationMapper.existsCompanyJob(userId, jobPostId)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "추천에 사용할 채용 공고를 찾을 수 없습니다.");
        }

        return recommendationMapper.findRecommendedCandidates(jobPostId, normalizeLimit(limit))
                .stream()
                .map(this::toCandidateItem)
                .toList();
    }

    private JobRecommendationItem toJobItem(JobRecommendationRow row) {
        List<String> matchedSkills = parseCsv(row.getMatchedSkillsCsv());
        return new JobRecommendationItem(
                row.getId(),
                row.getCompany(),
                row.getLocation(),
                row.getTitle(),
                parseCsv(row.getTagsCsv()),
                toPercent(row.getScore()),
                matchedSkills,
                reason(matchedSkills),
                formatSalary(row.getSalaryMin(), row.getSalaryMax(), row.getSalaryNegotiable()),
                formatBadge(row.getDeadline())
        );
    }

    private CandidateRecommendationItem toCandidateItem(CandidateRecommendationRow row) {
        List<String> matchedSkills = parseCsv(row.getMatchedSkillsCsv());
        return new CandidateRecommendationItem(
                row.getUserId(),
                row.getResumeId(),
                row.getName(),
                row.getProfessionalTitle(),
                row.getLocation(),
                row.getCareerYears() == null ? 0 : row.getCareerYears(),
                row.getResumeTitle(),
                toPercent(row.getScore()),
                matchedSkills,
                reason(matchedSkills)
        );
    }

    private int normalizeLimit(Integer limit) {
        return limit == null ? DEFAULT_LIMIT : Math.max(1, Math.min(limit, MAX_LIMIT));
    }

    private int toPercent(BigDecimal value) {
        if (value == null) {
            return 0;
        }
        return Math.max(0, Math.min(100, value.setScale(0, java.math.RoundingMode.HALF_UP).intValue()));
    }

    private List<String> parseCsv(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }

    private String reason(List<String> matchedSkills) {
        if (matchedSkills.isEmpty()) {
            return "경력, 지역, 근무 조건을 기준으로 추천되었습니다.";
        }
        return String.join(", ", matchedSkills) + " 역량이 요구 조건과 일치합니다.";
    }

    private String formatSalary(Integer salaryMin, Integer salaryMax, Boolean salaryNegotiable) {
        if (Boolean.TRUE.equals(salaryNegotiable) || salaryMin == null || salaryMax == null) {
            return "협의 후 결정";
        }
        return String.format("%,d만~%,d만원", salaryMin, salaryMax);
    }

    private String formatBadge(LocalDate deadline) {
        if (deadline == null) {
            return "상시채용";
        }
        long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), deadline);
        if (daysLeft < 0) {
            return "마감";
        }
        if (daysLeft == 0) {
            return "오늘마감";
        }
        return "D-" + daysLeft;
    }
}
