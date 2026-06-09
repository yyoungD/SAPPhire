package com.sapphire.domain.job.service;

import com.sapphire.domain.job.dto.JobCreateParam;
import com.sapphire.domain.job.dto.JobCreateRequest;
import com.sapphire.domain.job.dto.JobCreateResponse;
import com.sapphire.domain.job.dto.JobDetail;
import com.sapphire.domain.job.dto.JobDetailRow;
import com.sapphire.domain.job.dto.JobListItem;
import com.sapphire.domain.job.dto.JobPostRow;
import com.sapphire.domain.job.mapper.JobPostMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public JobCreateResponse createJob(Long userId, JobCreateRequest request) {
        Long companyProfileId = jobPostMapper.findCompanyProfileIdByUserId(userId);
        if (companyProfileId == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Company profile is required.");
        }

        JobCreateParam param = new JobCreateParam();
        param.setCompanyProfileId(companyProfileId);
        param.setTitle(request.title().trim());
        param.setDescription(blankToNull(request.description()));
        param.setResponsibilities(blankToNull(request.responsibilities()));
        param.setQualifications(blankToNull(request.qualifications()));
        param.setPreferredQualifications(blankToNull(request.preferredQualifications()));
        param.setEmploymentType(blankToNull(request.employmentType()));
        param.setExperienceLevel(blankToNull(request.experienceLevel()));
        param.setMinCareerYears(request.minCareerYears());
        param.setMaxCareerYears(request.maxCareerYears());
        param.setLocation(blankToNull(request.location()));
        param.setWorkType(blankToNull(request.workType()));
        param.setSalaryMin(request.salaryMin());
        param.setSalaryMax(request.salaryMax());
        param.setSalaryNegotiable(request.salaryNegotiable() == null ? Boolean.TRUE : request.salaryNegotiable());
        param.setDeadline(request.deadline());
        param.setStatus(normalizeStatus(request.status()));

        jobPostMapper.insertJob(param);

        if (request.tags() != null) {
            request.tags().stream()
                    .map(this::blankToNull)
                    .filter(tag -> tag != null && tag.length() <= 50)
                    .distinct()
                    .forEach(tag -> jobPostMapper.insertJobTag(param.getId(), tag));
        }

        if (request.sapSkillIds() != null) {
            request.sapSkillIds().stream()
                    .filter(id -> id != null && id > 0)
                    .distinct()
                    .forEach(id -> jobPostMapper.insertJobSapSkill(param.getId(), id));
        }

        return new JobCreateResponse(param.getId(), param.getStatus());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobListItem> findOpenJobs(Integer limit) {
        int size = limit == null ? DEFAULT_LIMIT : Math.max(1, Math.min(limit, MAX_LIMIT));
        return jobPostMapper.findOpenJobs(size)
                .stream()
                .map(this::toListItem)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobDetail findOpenJob(Long id) {
        JobDetailRow row = jobPostMapper.findOpenJobById(id);
        if (row == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Job post not found.");
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
            return "Recently posted";
        }
        long days = ChronoUnit.DAYS.between(createdAt.toLocalDate(), LocalDate.now());
        return days <= 0 ? "Today" : days + " days ago";
    }

    private String formatSalary(Integer salaryMin, Integer salaryMax, Boolean salaryNegotiable) {
        if (Boolean.TRUE.equals(salaryNegotiable) || salaryMin == null || salaryMax == null) {
            return "Negotiable";
        }
        return String.format("%,d-% ,d", salaryMin, salaryMax).replace(" ", "");
    }

    private String formatBadge(LocalDate deadline) {
        if (deadline == null) {
            return "Always open";
        }
        long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), deadline);
        if (daysLeft < 0) {
            return "Closed";
        }
        if (daysLeft == 0) {
            return "Due today";
        }
        return "D-" + daysLeft;
    }

    private String formatDeadline(LocalDate deadline) {
        return deadline == null ? "Always open" : deadline.toString();
    }

    private String formatCareer(Integer minCareerYears, Integer maxCareerYears) {
        if (minCareerYears == null && maxCareerYears == null) {
            return "Any experience";
        }
        if (minCareerYears == null || minCareerYears == 0) {
            return "Up to " + maxCareerYears + " years";
        }
        if (maxCareerYears == null) {
            return minCareerYears + "+ years";
        }
        return minCareerYears + "-" + maxCareerYears + " years";
    }

    private String formatEmploymentType(String employmentType) {
        return employmentType == null ? "UNSPECIFIED" : employmentType;
    }

    private String formatWorkType(String workType) {
        return workType == null ? "UNSPECIFIED" : workType;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "DRAFT";
        }
        String normalized = status.trim().toUpperCase();
        if (!List.of("DRAFT", "OPEN", "CLOSED").contains(normalized)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "잘못된 상태입니다. 허용되는 값: DRAFT, OPEN, CLOSED");
        }
        return normalized;
    }
}
