package com.sapphire.domain.profile.dto;

public record CompanyProfileUpdateRequest(
        String companyName,
        String businessNumber,
        String industry,
        String companySize,
        String websiteUrl,
        Long logoFileId,
        String description,
        String address
) {
}
