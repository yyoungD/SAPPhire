package com.sapphire.domain.job.service;

import com.sapphire.domain.job.dto.JobDetail;
import com.sapphire.domain.job.dto.JobDetailRow;
import com.sapphire.domain.job.dto.JobListItem;
import com.sapphire.domain.job.dto.JobPostRow;
import com.sapphire.domain.job.mapper.JobPostMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Service
public class JobPostServiceImpl implements JobPostService {
    private static final int DEFAULT_LIMIT = 200;
    private static final int MAX_LIMIT = 200;

    private final JobPostMapper jobPostMapper;

    public JobPostServiceImpl(JobPostMapper jobPostMapper) {
        this.jobPostMapper = jobPostMapper;
    }

    @Override
    public List<JobListItem> findOpenJobs(Integer limit) {
        int size = limit == null ? DEFAULT_LIMIT : Math.max(1, Math.min(limit, MAX_LIMIT));
        return jobPostMapper.findOpenJobs(size)
                .stream()
                .map(this::toListItem)
                .toList();
    }

    @Override
    public JobDetail findOpenJob(Long id) {
        JobDetailRow row = jobPostMapper.findOpenJobById(id);
        if (row == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "채용 공고를 찾을 수 없습니다.");
        }
        return new JobDetail(
                row.getId(),
                row.getCompany(),
                row.getTitle(),
                row.getLocation(),
                formatEmploymentType(row.getEmploymentType()),
                row.getExperienceLevel(),
                formatCareer(row.getMinCareerYears(), row.getMaxCareerYears()),
                formatWorkType(row.getWorkType()),
                formatSalary(row.getSalaryMin(), row.getSalaryMax(), row.getSalaryNegotiable()),
                formatDeadline(row.getDeadline()),
                formatBadge(row.getDeadline()),
                row.getViewCount(),
                parseCsv(row.getTagsCsv()),
                parseCsv(row.getSkillsCsv()),
                row.getDescription(),
                row.getResponsibilities(),
                row.getQualifications(),
                row.getPreferredQualifications()
        );
    }

    private JobListItem toListItem(JobPostRow row) {
        return new JobListItem(
                row.getId(),
                row.getCompany(),
                row.getLocation(),
                row.getTitle(),
                parseCsv(row.getTagsCsv()),
                formatPosted(row.getCreatedAt()),
                formatSalary(row.getSalaryMin(), row.getSalaryMax(), row.getSalaryNegotiable()),
                formatBadge(row.getDeadline())
        );
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

    private String formatPosted(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "최근 등록";
        }
        long days = ChronoUnit.DAYS.between(createdAt.toLocalDate(), LocalDate.now());
        if (days <= 0) {
            return "오늘";
        }
        return days + "일 전";
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

    private String formatDeadline(LocalDate deadline) {
        if (deadline == null) {
            return "상시채용";
        }
        return deadline.toString();
    }

    private String formatCareer(Integer minCareerYears, Integer maxCareerYears) {
        if (minCareerYears == null && maxCareerYears == null) {
            return "경력 무관";
        }
        if (minCareerYears == null || minCareerYears == 0) {
            return "신입 가능 / 최대 " + maxCareerYears + "년";
        }
        if (maxCareerYears == null) {
            return minCareerYears + "년 이상";
        }
        return minCareerYears + "년~" + maxCareerYears + "년";
    }

    private String formatEmploymentType(String employmentType) {
        if ("FULL_TIME".equals(employmentType)) {
            return "정규직";
        }
        if ("CONTRACT".equals(employmentType)) {
            return "계약직";
        }
        if ("PROJECT".equals(employmentType)) {
            return "프로젝트";
        }
        return employmentType == null ? "협의" : employmentType;
    }

    private String formatWorkType(String workType) {
        if ("ONSITE".equals(workType)) {
            return "출근";
        }
        if ("REMOTE".equals(workType)) {
            return "원격";
        }
        if ("HYBRID".equals(workType)) {
            return "하이브리드";
        }
        return workType == null ? "협의" : workType;
    }
}
