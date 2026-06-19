package com.sapphire.domain.user.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdminCompanyDetailResponse {
    private Long id;
    private Long companyProfileId;
    private String email;
    private String name;
    private String phone;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime recentLoginAt;

    private String companyName;
    private String businessNumber;
    private String verificationStatus;
    private String websiteUrl;
    private String logoUrl;
    private String address;
    private String description;
    private String industry;
    private String companySize;

    private Integer jobCount;
    private Integer openJobCount;
    private Integer closedJobCount;
    private Integer hiddenJobCount;
    private Integer draftJobCount;

    private Integer applicantCount;
    private Integer unreadApplicantCount;
    private Integer progressingApplicationCount;

    private Integer offerCount;
    private Integer acceptedOfferCount;
    private Integer declinedOfferCount;
    private Integer pendingOfferCount;
    private Integer canceledOfferCount;

    private Integer attachmentCount;
    private Integer reportCount;
    private Integer sanctionCount;
    private String adminMemo;

    private LocalDateTime latestJobCreatedAt;
    private LocalDateTime latestApplicationAt;
    private LocalDateTime latestOfferCreatedAt;
}
