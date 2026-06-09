package com.sapphire.domain.job.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JobAttachmentResponse {
    private Long id;
    private String originalName;
    private String contentType;
    private Long fileSize;
    private String fileCategory;
    private String createdAt;
}
