package com.sapphire.domain.profile.service;

import com.sapphire.domain.profile.dto.CompanyProfile;
import com.sapphire.domain.profile.dto.CompanyProfileUpdateRequest;
import org.springframework.web.multipart.MultipartFile;

public interface CompanyProfileService {
    CompanyProfile findMe(Long userId);

    CompanyProfile updateMe(Long userId, CompanyProfileUpdateRequest request, MultipartFile logoImage, boolean removeLogo);
}
