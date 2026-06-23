package com.sapphire.domain.positionoffer.service;

import com.sapphire.domain.notification.dto.NotificationCreateParam;
import com.sapphire.domain.notification.service.NotificationService;
import com.sapphire.domain.positionoffer.dto.PositionOfferCreateParam;
import com.sapphire.domain.positionoffer.dto.PositionOfferCreateRequest;
import com.sapphire.domain.positionoffer.dto.PositionOfferDetail;
import com.sapphire.domain.positionoffer.dto.PositionOfferInsight;
import com.sapphire.domain.positionoffer.dto.PositionOfferListItem;
import com.sapphire.domain.positionoffer.dto.PositionOfferListResponse;
import com.sapphire.domain.positionoffer.dto.PositionOfferNotificationTarget;
import com.sapphire.domain.positionoffer.dto.PositionOfferRow;
import com.sapphire.domain.positionoffer.mapper.PositionOfferMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Service
public class PositionOfferServiceImpl implements PositionOfferService {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy. MM. dd HH:mm");
    private static final Set<String> PERSONAL_STATUSES = Set.of("ACCEPTED", "DECLINED");
    private static final Set<String> COMPANY_STATUSES = Set.of("CANCELED");

    private final PositionOfferMapper positionOfferMapper;
    private final NotificationService notificationService;

    public PositionOfferServiceImpl(PositionOfferMapper positionOfferMapper, NotificationService notificationService) {
        this.positionOfferMapper = positionOfferMapper;
        this.notificationService = notificationService;
    }

    @Override
    public PositionOfferListResponse findOffers(Long userId, String role) {
        List<PositionOfferRow> rows = "COMPANY".equals(role)
                ? positionOfferMapper.findCompanyOffers(userId)
                : positionOfferMapper.findReceivedOffers(userId);
        List<PositionOfferListItem> offers = rows.stream().map(this::toListItem).toList();
        int total = offers.size();
        int waiting = (int) offers.stream().filter(offer -> "SENT".equals(offer.status())).count();
        int accepted = (int) offers.stream().filter(offer -> "ACCEPTED".equals(offer.status())).count();
        int averageScore = rows.isEmpty()
                ? 0
                : (int) Math.round(rows.stream().mapToInt(this::score).average().orElse(0));
        PositionOfferInsight insight = new PositionOfferInsight(
                rows.isEmpty() ? 0 : Math.max(55, Math.min(98, averageScore - 4)),
                rows.isEmpty() ? 0 : Math.max(60, Math.min(99, averageScore + 3)),
                "25분",
                averageScore >= 90 ? "최상" : averageScore >= 80 ? "높음" : "보통",
                "S/4HANA와 핵심 모듈 경험을 제안서에 함께 강조하면 응답 가능성이 높아집니다."
        );
        return new PositionOfferListResponse(offers, total, waiting, accepted, waiting, insight);
    }

    @Override
    public PositionOfferDetail findOffer(Long userId, String role, Long id) {
        PositionOfferRow row = findAccessibleRow(userId, role, id);
        return toDetail(row);
    }

    @Override
    @Transactional
    public PositionOfferDetail create(Long userId, PositionOfferCreateRequest request) {
        Long companyProfileId = positionOfferMapper.findCompanyProfileIdByUserId(userId);
        if (companyProfileId == null) {
            throw new CustomException(ErrorCode.ACCESS_DENIED, "기업 회원만 포지션 제안을 보낼 수 있습니다.");
        }
        if (!positionOfferMapper.existsReceiver(request.receiverUserId())) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "제안을 받을 개인 회원을 찾을 수 없습니다.");
        }
        if (request.resumeId() != null && !positionOfferMapper.existsVisibleResume(request.receiverUserId(), request.resumeId())) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "제안 대상 이력서를 확인할 수 없습니다.");
        }

        PositionOfferCreateParam param = new PositionOfferCreateParam();
        param.setCompanyProfileId(companyProfileId);
        param.setReceiverUserId(request.receiverUserId());
        param.setResumeId(request.resumeId());
        param.setTitle(request.title().trim());
        param.setMessage(normalizeText(request.message()));
        param.setExpiresAt(request.expiresAt());
        positionOfferMapper.insert(param);
        createPositionOfferReceivedNotification(param.getId());
        return findOffer(userId, "COMPANY", param.getId());
    }

    @Override
    @Transactional
    public PositionOfferDetail updateStatus(Long userId, String role, Long id, String status) {
        PositionOfferRow row = findAccessibleRow(userId, role, id);
        String normalizedStatus = normalizeStatus(status);
        if ("COMPANY".equals(role) && !COMPANY_STATUSES.contains(normalizedStatus)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "기업 회원은 제안 취소만 할 수 있습니다.");
        }
        if (!"COMPANY".equals(role) && !PERSONAL_STATUSES.contains(normalizedStatus)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "받은 제안은 수락 또는 거절만 할 수 있습니다.");
        }
        if (!"SENT".equals(row.getRawStatus())) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "대기 중인 제안만 상태를 변경할 수 있습니다.");
        }
        positionOfferMapper.updateStatus(id, normalizedStatus);
        if (!"COMPANY".equals(role)) {
            createPositionOfferAnswerNotification(id, normalizedStatus);
        }
        return findOffer(userId, role, id);
    }

    private void createPositionOfferAnswerNotification(Long offerId, String status) {
        PositionOfferNotificationTarget target = positionOfferMapper.findNotificationTarget(offerId);
        if (target == null || target.getCompanyUserId() == null) {
            return;
        }

        String offerTitle = normalizeNotificationTitle(target.getTitle(), "포지션 제안");
        NotificationCreateParam notification = new NotificationCreateParam();
        notification.setUserId(target.getCompanyUserId());
        notification.setType("POSITION_OFFER");
        notification.setTitle("포지션 제안 \"" + offerTitle + "\"에 답변이 도착했습니다.");
        notification.setMessage("ACCEPTED".equals(status) ? "지원자가 제안을 수락했습니다." : "지원자가 제안을 거절했습니다.");
        notification.setTargetUrl("/company/position-offers/detail?id=" + offerId);
        notificationService.create(notification);
    }

    private void createPositionOfferReceivedNotification(Long offerId) {
        PositionOfferNotificationTarget target = positionOfferMapper.findCreateNotificationTarget(offerId);
        if (target == null || target.getReceiverUserId() == null) {
            return;
        }

        String companyName = normalizeNotificationTitle(target.getCompanyName(), "기업");
        String offerTitle = normalizeNotificationTitle(target.getTitle(), "포지션 제안");
        NotificationCreateParam notification = new NotificationCreateParam();
        notification.setUserId(target.getReceiverUserId());
        notification.setType("POSITION_OFFER");
        notification.setTitle(companyName + "에서 포지션 제안을 보냈습니다.");
        notification.setMessage(offerTitle);
        notification.setTargetUrl("/personal/position-offers/detail?id=" + offerId);
        notificationService.create(notification);
    }

    private String normalizeNotificationTitle(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private PositionOfferRow findAccessibleRow(Long userId, String role, Long id) {
        PositionOfferRow row = "COMPANY".equals(role)
                ? positionOfferMapper.findCompanyOffer(userId, id)
                : positionOfferMapper.findReceivedOffer(userId, id);
        if (row == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "포지션 제안을 찾을 수 없습니다.");
        }
        return row;
    }

    private PositionOfferListItem toListItem(PositionOfferRow row) {
        return new PositionOfferListItem(
                row.getId(),
                row.getReceiverUserId(),
                row.getResumeId(),
                row.getCompanyName(),
                row.getReceiverName(),
                row.getResumeTitle(),
                row.getTitle(),
                row.getStatus(),
                formatStatus(row.getStatus()),
                score(row),
                parseCsv(row.getTagsCsv()),
                format(row.getCreatedAt()),
                format(row.getExpiresAt())
        );
    }

    private PositionOfferDetail toDetail(PositionOfferRow row) {
        return new PositionOfferDetail(
                row.getId(),
                row.getReceiverUserId(),
                row.getResumeId(),
                row.getCompanyName(),
                row.getReceiverName(),
                row.getResumeTitle(),
                row.getTitle(),
                row.getMessage(),
                row.getStatus(),
                formatStatus(row.getStatus()),
                score(row),
                parseCsv(row.getTagsCsv()),
                format(row.getCreatedAt()),
                format(row.getUpdatedAt()),
                format(row.getExpiresAt())
        );
    }

    private int score(PositionOfferRow row) {
        BigDecimal value = row.getMatchScore();
        if (value == null) {
            return 0;
        }
        return Math.max(0, Math.min(100, value.setScale(0, java.math.RoundingMode.HALF_UP).intValue()));
    }

    private String formatStatus(String status) {
        if ("SENT".equals(status)) return "대기";
        if ("ACCEPTED".equals(status)) return "수락";
        if ("DECLINED".equals(status)) return "거절";
        if ("EXPIRED".equals(status)) return "만료";
        if ("CANCELED".equals(status)) return "취소";
        return status == null ? "-" : status;
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

    private String format(java.time.LocalDateTime value) {
        return value == null ? null : value.format(DATE_TIME_FORMATTER);
    }

    private String normalizeText(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase();
    }
}
