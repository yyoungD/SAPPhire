package com.sapphire.domain.resume.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdminResumeResponse {
    private Long id;
    private Long userId;
    private String title;
    private String applicantName;
    private String applicantEmail;
    private String profileImageUrl;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
