package com.sapphire.domain.profile.service;

import com.sapphire.domain.profile.dto.PersonalProfile;

public interface PersonalProfileService {
    PersonalProfile findMe(Long userId);

    PersonalProfile updateMe(Long userId, PersonalProfile profile);
}
