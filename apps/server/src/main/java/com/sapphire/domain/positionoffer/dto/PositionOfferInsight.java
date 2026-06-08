package com.sapphire.domain.positionoffer.dto;

public record PositionOfferInsight(
        int acceptanceRate,
        int skillMatch,
        String commuteTime,
        String growthFit,
        String tip
) {
}
