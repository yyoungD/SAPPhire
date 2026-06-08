package com.sapphire.domain.positionoffer.dto;

import java.util.List;

public record PositionOfferDetail(
        Long id,
        Long receiverUserId,
        Long resumeId,
        String companyName,
        String receiverName,
        String resumeTitle,
        String title,
        String message,
        String status,
        String statusLabel,
        int matchScore,
        List<String> tags,
        String createdAt,
        String updatedAt,
        String expiresAt
) {
}
