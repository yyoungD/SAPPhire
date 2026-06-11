package com.sapphire.domain.application.service;

import com.sapphire.domain.application.dto.ApplicationCreateParam;
import com.sapphire.domain.application.dto.ApplicationCreateRequest;
import com.sapphire.domain.application.dto.ApplicationDetail;
import com.sapphire.domain.application.dto.ApplicationDetailRow;
import com.sapphire.domain.application.dto.ApplicationListItem;
import com.sapphire.domain.application.dto.ApplicationListRow;
import com.sapphire.domain.application.mapper.ApplicationMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ApplicationServiceImpl implements ApplicationService {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy. MM. dd HH:mm");

    private final ApplicationMapper applicationMapper;

    public ApplicationServiceImpl(ApplicationMapper applicationMapper) {
        this.applicationMapper = applicationMapper;
    }

    @Override
    @Transactional
    public ApplicationDetail create(Long userId, ApplicationCreateRequest request) {
        if (!applicationMapper.existsOpenJob(request.jobPostId())) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "지원할 수 있는 채용 공고를 찾을 수 없습니다.");
        }
        if (!applicationMapper.existsMyResume(userId, request.resumeId())) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "본인의 이력서만 지원에 사용할 수 있습니다.");
        }
        if (applicationMapper.existsActiveApplication(userId, request.jobPostId())) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "이미 지원한 채용 공고입니다.");
        }

        ApplicationCreateParam param = new ApplicationCreateParam();
        param.setJobPostId(request.jobPostId());
        param.setResumeId(request.resumeId());
        param.setUserId(userId);
        param.setCoverLetter(normalizeText(request.coverLetter()));
        applicationMapper.insert(param);
        applicationMapper.insertStatusLog(param.getId(), userId);
        if (request.attachmentFileIds() != null && !request.attachmentFileIds().isEmpty()) {
            applicationMapper.insertAttachments(param.getId(), userId, request.attachmentFileIds());
        }

        return findApplication(userId, "PERSONAL", param.getId());
    }

    @Override
    public List<ApplicationListItem> findApplications(Long userId, String role, Long jobPostId) {
        List<ApplicationListRow> rows = "COMPANY".equals(role)
                ? applicationMapper.findCompanyApplications(userId, jobPostId)
                : applicationMapper.findMyApplications(userId);
        return rows.stream().map(this::toListItem).toList();
    }

    @Override
    public ApplicationDetail findApplication(Long userId, String role, Long id) {
        ApplicationDetailRow row = "COMPANY".equals(role)
                ? applicationMapper.findCompanyApplicationDetail(userId, id)
                : applicationMapper.findMyApplicationDetail(userId, id);
        if (row == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "지원 정보를 찾을 수 없습니다.");
        }
        return toDetail(row);
    }

    private ApplicationListItem toListItem(ApplicationListRow row) {
        return new ApplicationListItem(
                row.getId(),
                row.getJobPostId(),
                row.getResumeId(),
                row.getJobTitle(),
                row.getJobPosition(),
                row.getCompanyName(),
                row.getApplicantName(),
                row.getResumeTitle(),
                row.getCareerYears(),
                row.getStatus(),
                formatStatus(row.getStatus()),
                row.getAppliedAt() == null ? null : row.getAppliedAt().format(DATE_TIME_FORMATTER),
                row.getUpdatedAt() == null ? null : row.getUpdatedAt().format(DATE_TIME_FORMATTER)
        );
    }

    private ApplicationDetail toDetail(ApplicationDetailRow row) {
        return new ApplicationDetail(
                row.getId(),
                row.getJobPostId(),
                row.getResumeId(),
                row.getJobTitle(),
                row.getCompanyName(),
                row.getApplicantName(),
                row.getResumeTitle(),
                row.getStatus(),
                formatStatus(row.getStatus()),
                row.getAppliedAt() == null ? null : row.getAppliedAt().format(DATE_TIME_FORMATTER),
                row.getUpdatedAt() == null ? null : row.getUpdatedAt().format(DATE_TIME_FORMATTER),
                row.getCoverLetter(),
                row.getJobLocation(),
                formatEmploymentType(row.getEmploymentType()),
                formatWorkType(row.getWorkType())
        );
    }

    private String normalizeText(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String formatStatus(String status) {
        if ("SUBMITTED".equals(status)) return "신규";
        if ("REVIEWING".equals(status)) return "서류전형";
        if ("INTERVIEW".equals(status)) return "면접";
        if ("OFFERED".equals(status)) return "합격 제안";
        if ("REJECTED".equals(status)) return "불합격";
        if ("WITHDRAWN".equals(status)) return "지원 취소";
        return status == null ? "-" : status;
    }

    private String formatEmploymentType(String employmentType) {
        if ("FULL_TIME".equals(employmentType)) return "정규직";
        if ("CONTRACT".equals(employmentType)) return "계약직";
        if ("PROJECT".equals(employmentType)) return "프로젝트";
        return employmentType == null ? "미정" : employmentType;
    }

    private String formatWorkType(String workType) {
        if ("ONSITE".equals(workType)) return "출근";
        if ("REMOTE".equals(workType)) return "원격";
        if ("HYBRID".equals(workType)) return "하이브리드";
        return workType == null ? "미정" : workType;
    }
}
