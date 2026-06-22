package com.sapphire.domain.user.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdminCompanyResponse {
    private Long id;
    private Long companyProfileId;
    private String email;
    private String name;
    private String phone;
    private String role;
    private String status;
    private String companyName;
    private String businessNumber;
    private String industry;
    private String verificationStatus;
    private Long logoFileId;
    private String logoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
