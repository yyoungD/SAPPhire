package com.sapphire.domain.profile.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PersonalProfileMapper {
    void insertDefault(@Param("userId") Long userId);
}
