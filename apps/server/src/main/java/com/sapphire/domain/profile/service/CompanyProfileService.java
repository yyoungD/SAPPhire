package com.sapphire.domain.profile.service;

import com.sapphire.domain.profile.dto.CompanyProfile;

public interface CompanyProfileService {
    CompanyProfile findMe(Long userId);
}
