package com.sapphire.domain.profile.mapper;

import com.sapphire.domain.profile.dto.PersonalProfile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PersonalProfileMapper {
    void insertDefault(@Param("userId") Long userId);

    PersonalProfile findByUserId(@Param("userId") Long userId);

    int updateByUserId(PersonalProfile profile);
}
