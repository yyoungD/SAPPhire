package com.sapphire.domain.profile.service;

import com.sapphire.domain.profile.dto.PersonalProfile;
import com.sapphire.domain.profile.mapper.PersonalProfileMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PersonalProfileServiceImpl implements PersonalProfileService {
    private final PersonalProfileMapper personalProfileMapper;

    public PersonalProfileServiceImpl(PersonalProfileMapper personalProfileMapper) {
        this.personalProfileMapper = personalProfileMapper;
    }

    @Override
    @Transactional
    public PersonalProfile findMe(Long userId) {
        PersonalProfile profile = personalProfileMapper.findByUserId(userId);
        if (profile == null) {
            personalProfileMapper.insertDefault(userId);
            profile = personalProfileMapper.findByUserId(userId);
        }
        return profile;
    }

    @Override
    @Transactional
    public PersonalProfile updateMe(Long userId, PersonalProfile profile) {
        findMe(userId);
        profile.setUserId(userId);
        profile.setCareerYears(profile.getCareerYears() == null ? 0 : Math.max(0, profile.getCareerYears()));
        personalProfileMapper.updateByUserId(profile);
        return personalProfileMapper.findByUserId(userId);
    }
}
