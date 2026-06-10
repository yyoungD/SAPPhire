package com.sapphire.domain.profile.service;

import com.sapphire.domain.file.dto.FileRecord;
import com.sapphire.domain.profile.dto.CompanyProfile;
import com.sapphire.domain.profile.dto.CompanyProfileUpdateRequest;
import com.sapphire.domain.profile.mapper.CompanyProfileMapper;
import com.sapphire.domain.user.service.ProfileImageStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CompanyProfileServiceImpl implements CompanyProfileService {
    private final CompanyProfileMapper companyProfileMapper;
    private final ProfileImageStorageService profileImageStorageService;

    public CompanyProfileServiceImpl(
            CompanyProfileMapper companyProfileMapper,
            ProfileImageStorageService profileImageStorageService
    ) {
        this.companyProfileMapper = companyProfileMapper;
        this.profileImageStorageService = profileImageStorageService;
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

    @Override
    @Transactional
    public CompanyProfile updateMe(Long userId, CompanyProfileUpdateRequest request, MultipartFile logoImage, boolean removeLogo) {
        CompanyProfile current = companyProfileMapper.findByUserId(userId);
        if (current == null) {
            companyProfileMapper.insertDefault(userId);
            current = companyProfileMapper.findByUserId(userId);
        }

        Long logoFileId = removeLogo ? null : current.getLogoFileId();
        if (logoImage != null && !logoImage.isEmpty()) {
            FileRecord storedLogo = profileImageStorageService.storeCompanyLogo(userId, logoImage);
            logoFileId = storedLogo.getId();
        }

        companyProfileMapper.updateByUserId(userId, normalize(request, logoFileId));
        return companyProfileMapper.findByUserId(userId);
    }

    private CompanyProfileUpdateRequest normalize(CompanyProfileUpdateRequest request, Long logoFileId) {
        return new CompanyProfileUpdateRequest(
                blankToNull(request.companyName()),
                blankToNull(request.businessNumber()),
                blankToNull(request.industry()),
                blankToNull(request.companySize()),
                blankToNull(request.websiteUrl()),
                logoFileId,
                blankToNull(request.description()),
                blankToNull(request.address())
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
