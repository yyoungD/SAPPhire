package com.sapphire.domain.application.service;

import com.sapphire.domain.application.dto.ApplicationCreateRequest;
import com.sapphire.domain.application.dto.ApplicationDetail;
import com.sapphire.domain.application.dto.ApplicationListItem;

import java.util.List;

public interface ApplicationService {
    ApplicationDetail create(Long userId, ApplicationCreateRequest request);

    List<ApplicationListItem> findApplications(Long userId, String role, Long jobPostId);

    ApplicationDetail findApplication(Long userId, String role, Long id);
}
