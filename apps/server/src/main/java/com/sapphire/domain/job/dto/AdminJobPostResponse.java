package com.sapphire.domain.job.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdminJobPostResponse {
    private Long id;
    private Long companyProfileId;
    private String title;
    private String companyName;
    private String companyEmail;
    private String location;
    private String status;
    private Integer viewCount;
    private String logoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
