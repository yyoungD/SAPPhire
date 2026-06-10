package com.sapphire.domain.job.service;

import com.sapphire.domain.job.dto.CompanyJobListItem;
import com.sapphire.domain.job.dto.CompanyJobPostRow;
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
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Service
public class JobPostServiceImpl implements JobPostService {
    private static final int DEFAULT_LIMIT = 200;
    private static final int MAX_LIMIT = 200;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy. MM. dd");

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

        JobCreateParam param = toParam(companyProfileId, request);

        jobPostMapper.insertJob(param);

        syncJobRelations(userId, param.getId(), request);

        return new JobCreateResponse(param.getId(), param.getStatus());
    }

    @Override
    @Transactional
    public JobCreateResponse updateJob(Long userId, Long id, JobCreateRequest request) {
        Long companyProfileId = jobPostMapper.findCompanyProfileIdByUserId(userId);
        if (companyProfileId == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Company profile is required.");
        }

        JobCreateParam param = toParam(companyProfileId, request);
        param.setId(id);
        int updated = jobPostMapper.updateJob(companyProfileId, param);
        if (updated == 0) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Job post not found.");
        }

        jobPostMapper.deleteJobTags(id);
        jobPostMapper.deleteJobSapSkills(id);
        jobPostMapper.deleteJobAttachments(id);
        syncJobRelations(userId, id, request);

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
    public List<CompanyJobListItem> findCompanyJobs(Long userId) {
        Long companyProfileId = jobPostMapper.findCompanyProfileIdByUserId(userId);
        if (companyProfileId == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Company profile is required.");
        }
        return jobPostMapper.findCompanyJobs(companyProfileId)
                .stream()
                .map(this::toCompanyListItem)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobDetail findOpenJob(Long id) {
        JobDetailRow row = jobPostMapper.findOpenJobById(id);
        if (row == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Job post not found.");
        }
        return toDetail(row);
    }

    @Override
    @Transactional(readOnly = true)
    public JobDetail findCompanyJob(Long userId, Long id) {
        Long companyProfileId = jobPostMapper.findCompanyProfileIdByUserId(userId);
        if (companyProfileId == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Company profile is required.");
        }
        JobDetailRow row = jobPostMapper.findCompanyJobById(companyProfileId, id);
        if (row == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Job post not found.");
        }
        return toDetail(row);
    }

    private JobDetail toDetail(JobDetailRow row) {
        List<String> tags = parseCsv(row.getTagsCsv());
        return new JobDetail(
                row.getId(),
                row.getCompany(),
                row.getTitle(),
                row.getLocation(),
                row.getStatus(),
                formatStatus(row.getStatus()),
                row.getExperienceLevel(),
                extractProjectType(tags),
                formatEmploymentType(row.getEmploymentType()),
                row.getExperienceLevel(),
                formatCareer(row.getMinCareerYears(), row.getMaxCareerYears()),
                formatWorkType(row.getWorkType()),
                formatSalary(row.getSalaryMin(), row.getSalaryMax(), row.getSalaryNegotiable()),
                row.getSalaryMin(),
                row.getSalaryMax(),
                row.getSalaryNegotiable(),
                formatDeadline(row.getDeadline()),
                row.getMinCareerYears(),
                row.getMaxCareerYears(),
                formatBadge(row.getDeadline()),
                row.getViewCount(),
                tags,
                parseCsv(row.getSkillsCsv()),
                row.getDescription(),
                row.getResponsibilities(),
                row.getQualifications(),
                row.getPreferredQualifications(),
                jobPostMapper.findJobAttachments(row.getId())
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

    private CompanyJobListItem toCompanyListItem(CompanyJobPostRow row) {
        List<String> tags = parseCsv(row.getSkillsCsv());
        if (tags.isEmpty()) {
            tags = parseCsv(row.getTagsCsv());
        }
        return new CompanyJobListItem(
                row.getId(),
                row.getCompany(),
                row.getTitle(),
                row.getLocation(),
                row.getExperienceLevel(),
                row.getStatus(),
                formatStatus(row.getStatus()),
                row.getCreatedAt() == null ? "-" : row.getCreatedAt().format(DATE_FORMATTER),
                row.getViewCount(),
                tags
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

    private JobCreateParam toParam(Long companyProfileId, JobCreateRequest request) {
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
        return param;
    }

    private void syncJobRelations(Long userId, Long jobPostId, JobCreateRequest request) {
        if (request.tags() != null) {
            request.tags().stream()
                    .map(this::blankToNull)
                    .filter(tag -> tag != null && tag.length() <= 50)
                    .distinct()
                    .forEach(tag -> jobPostMapper.insertJobTag(jobPostId, tag));
        }

        if (request.sapSkillIds() != null) {
            request.sapSkillIds().stream()
                    .filter(id -> id != null && id > 0)
                    .distinct()
                    .forEach(id -> jobPostMapper.insertJobSapSkill(jobPostId, id));
        }

        if (request.attachmentFileIds() != null && !request.attachmentFileIds().isEmpty()) {
            List<Long> fileIds = request.attachmentFileIds().stream()
                    .filter(id -> id != null && id > 0)
                    .distinct()
                    .toList();
            if (!fileIds.isEmpty()) {
                jobPostMapper.insertJobAttachments(jobPostId, userId, fileIds);
            }
        }
    }

    private String extractProjectType(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return null;
        }
        return tags.stream()
                .filter(tag -> List.of("구축", "운영", "고도화", "전환").contains(tag))
                .findFirst()
                .orElse(null);
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "DRAFT";
        }
        String normalized = status.trim().toUpperCase();
        if (!List.of("DRAFT", "OPEN", "CLOSED", "DELETED").contains(normalized)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid job status. Allowed values are DRAFT, OPEN, CLOSED, DELETED.");
        }
        return normalized;
    }

    private String formatStatus(String status) {
        if ("OPEN".equals(status)) {
            return "모집 중";
        }
        if ("DRAFT".equals(status)) {
            return "임시저장";
        }
        if ("CLOSED".equals(status)) {
            return "마감";
        }
        if ("DELETED".equals(status)) {
            return "숨김";
        }
        return status == null ? "-" : status;
    }
}
