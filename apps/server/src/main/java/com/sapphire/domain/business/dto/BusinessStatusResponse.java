package com.sapphire.domain.business.dto;

public record BusinessStatusResponse(
        String businessNumber,
        boolean verified,
        String statusCode,
        String statusMessage,
        String taxType
) {
}
