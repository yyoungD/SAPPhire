package com.sapphire.domain.user.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdminUserDetailResponse {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String status;
    private String oauthProvider;
    private String profileImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime recentLoginAt;
    private String location;
    private Integer careerYears;
    private String workType;
    private Boolean profilePublic;
    private Integer resumeCount;
    private String primaryResumeTitle;
    private Integer publicResumeCount;
    private LocalDateTime latestResumeUpdatedAt;
    private Integer applicationCount;
    private Integer reviewingApplicationCount;
    private Integer acceptedApplicationCount;
    private Integer rejectedApplicationCount;
    private Integer canceledApplicationCount;
    private Integer bookmarkCount;
    private Integer offerCount;
    private Integer acceptedOfferCount;
    private Integer declinedOfferCount;
    private Integer pendingOfferCount;
    private Integer reportCount;
    private Integer sanctionCount;
    private String adminMemo;
}
