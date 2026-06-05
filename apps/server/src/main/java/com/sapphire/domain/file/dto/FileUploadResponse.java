package com.sapphire.domain.file.dto;

public record FileUploadResponse(
        Long id,
        String originalName,
        String contentType,
        long fileSize,
        String fileCategory,
        String createdAt
) {
}
