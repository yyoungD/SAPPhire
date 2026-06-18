package com.sapphire.domain.application.dto;

public record ApplicationAttachment(
        Long id,
        String originalName,
        String contentType,
        long fileSize,
        String fileCategory,
        String createdAt
) {
}
