package com.sapphire.domain.profile.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyProfile {
    private Long id;
    private Long userId;
    private String email;
    private String phone;
    private String companyName;
    private String businessNumber;
    private String industry;
    private String companySize;
    private String websiteUrl;
    private Long logoFileId;
    private String logoUrl;
    private String description;
    private String address;
    private String verificationStatus;
}
