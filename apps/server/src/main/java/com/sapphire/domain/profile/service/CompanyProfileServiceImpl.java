package com.sapphire.domain.profile.service;

import com.sapphire.domain.profile.dto.CompanyProfile;
import com.sapphire.domain.profile.mapper.CompanyProfileMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanyProfileServiceImpl implements CompanyProfileService {
    private final CompanyProfileMapper companyProfileMapper;

    public CompanyProfileServiceImpl(CompanyProfileMapper companyProfileMapper) {
        this.companyProfileMapper = companyProfileMapper;
    }

    @Override
    @Transactional
    public CompanyProfile findMe(Long userId) {
        CompanyProfile profile = companyProfileMapper.findByUserId(userId);
        if (profile == null) {
            companyProfileMapper.insertDefault(userId);
            profile = companyProfileMapper.findByUserId(userId);
        }
        return profile;
    }
}
