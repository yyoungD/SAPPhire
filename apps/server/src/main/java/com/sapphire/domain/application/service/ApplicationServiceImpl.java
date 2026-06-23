package com.sapphire.domain.application.service;

import com.sapphire.domain.application.dto.ApplicationCreateParam;
import com.sapphire.domain.application.dto.ApplicationCreateRequest;
import com.sapphire.domain.application.dto.ApplicationDetail;
import com.sapphire.domain.application.dto.ApplicationDetailRow;
import com.sapphire.domain.application.dto.ApplicationListItem;
import com.sapphire.domain.application.dto.ApplicationListRow;
import com.sapphire.domain.application.dto.ApplicationNotificationTarget;
import com.sapphire.domain.application.mapper.ApplicationMapper;
import com.sapphire.domain.notification.dto.NotificationCreateParam;
import com.sapphire.domain.notification.service.NotificationService;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

@Service
public class ApplicationServiceImpl implements ApplicationService {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy. MM. dd HH:mm");
    private static final Set<String> APPLICATION_STATUSES = Set.of("APPLIED", "REVIEWING", "INTERVIEW", "ACCEPTED", "REJECTED", "CANCELED");

    private final ApplicationMapper applicationMapper;
    private final NotificationService notificationService;

    public ApplicationServiceImpl(ApplicationMapper applicationMapper, NotificationService notificationService) {
        this.applicationMapper = applicationMapper;
        this.notificationService = notificationService;
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
        createNewApplicationNotification(param);
        if (request.attachmentFileIds() != null && !request.attachmentFileIds().isEmpty()) {
            applicationMapper.insertAttachments(param.getId(), userId, request.attachmentFileIds());
        }

        return findApplication(userId, "PERSONAL", param.getId());
    }

    private void createNewApplicationNotification(ApplicationCreateParam param) {
        ApplicationNotificationTarget target = applicationMapper.findNotificationTargetByJobPostId(param.getJobPostId());
        if (target == null || target.getCompanyUserId() == null) {
            return;
        }

        String jobTitle = normalizeNotificationTitle(target.getJobTitle(), "등록한 공고");
        NotificationCreateParam notification = new NotificationCreateParam();
        notification.setUserId(target.getCompanyUserId());
        notification.setType("NEW_APPLICATION");
        notification.setTitle(jobTitle + "에 신규 지원자가 있습니다.");
        notification.setMessage("지원자 상세를 확인해 주세요.");
        notification.setTargetUrl("/company/applications/detail?id=" + param.getId());
        notificationService.create(notification);
    }

    private String normalizeNotificationTitle(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    @Override
    public List<ApplicationListItem> findApplications(Long userId, String role, Long jobPostId) {
        List<ApplicationListRow> rows = "COMPANY".equals(role)
                ? applicationMapper.findCompanyApplications(userId, jobPostId)
                : applicationMapper.findMyApplications(userId);
        return rows.stream().map(this::toListItem).toList();
    }

    @Override
    @Transactional
    public ApplicationDetail findApplication(Long userId, String role, Long id) {
        ApplicationDetailRow row = "COMPANY".equals(role)
                ? applicationMapper.findCompanyApplicationDetail(userId, id)
                : applicationMapper.findMyApplicationDetail(userId, id);
        if (row == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "지원 정보를 찾을 수 없습니다.");
        }
        if ("COMPANY".equals(role)) {
            applicationMapper.markCompanyApplicationViewed(userId, id);
        }
        return toDetail(row);
    }

    @Override
    @Transactional
    public ApplicationDetail updateStatus(Long userId, String role, Long id, String status) {
        if (!"COMPANY".equals(role)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        String normalizedStatus = normalizeStatus(status);
        if (applicationMapper.findCompanyApplicationDetail(userId, id) == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Application not found.");
        }

        applicationMapper.insertStatusChangeLog(id, userId, normalizedStatus);
        int updated = applicationMapper.updateCompanyApplicationStatus(userId, id, normalizedStatus);
        if (updated == 0) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Application not found.");
        }
        createApplicationStatusNotification(id, normalizedStatus);

        return findApplication(userId, role, id);
    }

    private void createApplicationStatusNotification(Long applicationId, String status) {
        ApplicationNotificationTarget target = applicationMapper.findStatusNotificationTarget(applicationId);
        if (target == null || target.getApplicantUserId() == null) {
            return;
        }

        String companyName = normalizeNotificationTitle(target.getCompanyName(), "지원한 기업");
        NotificationCreateParam notification = new NotificationCreateParam();
        notification.setUserId(target.getApplicantUserId());
        notification.setType("SYSTEM");
        notification.setTitle(companyName + "에 지원한 이력서 상태가 변경되었습니다.");
        notification.setMessage("현재 상태: " + formatStatus(status));
        notification.setTargetUrl("/personal/applications/detail?id=" + applicationId);
        notificationService.create(notification);
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
                row.getApplicantProfileImageUrl(),
                row.getResumeTitle(),
                row.getResumeFileId(),
                row.getResumeOriginalFileName(),
                row.getPortfolioUrl(),
                applicationMapper.findAttachments(row.getId()),
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

    private String normalizeStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase();
        if (!APPLICATION_STATUSES.contains(normalized)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid application status. Allowed values are APPLIED, REVIEWING, INTERVIEW, ACCEPTED, REJECTED, CANCELED.");
        }
        return normalized;
    }

    private String formatStatus(String status) {
        if ("APPLIED".equals(status) || "SUBMITTED".equals(status)) return "지원 완료";
        if ("REVIEWING".equals(status)) return "서류전형";
        if ("INTERVIEW".equals(status)) return "면접";
        if ("ACCEPTED".equals(status) || "OFFERED".equals(status)) return "합격";
        if ("REJECTED".equals(status)) return "불합격";
        if ("CANCELED".equals(status) || "WITHDRAWN".equals(status)) return "취소";
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
