package com.sapphire.domain.job.dto;

import java.util.List;

public record CompanyJobListItem(
        Long id,
        String company,
        String title,
        String location,
        String position,
        String status,
        String statusLabel,
        String createdAt,
        Integer viewCount,
        List<String> tags
) {
}
