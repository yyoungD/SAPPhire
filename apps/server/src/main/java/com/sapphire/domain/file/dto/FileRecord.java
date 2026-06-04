package com.sapphire.domain.file.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FileRecord {
    private Long id;
    private Long uploaderUserId;
    private String originalName;
    private String storedName;
    private String filePath;
    private String fileUrl;
    private String contentType;
    private Long fileSize;
    private String fileCategory;
    private LocalDateTime createdAt;
}
