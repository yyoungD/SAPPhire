package com.sapphire.domain.job.dto;

import java.util.List;

public record JobListItem(
        Long id,
        String company,
        String location,
        String title,
        List<String> tags,
        String posted,
        String salary,
        String badge
) {
}
