package com.sapphire.domain.profile.mapper;

import com.sapphire.domain.profile.dto.CompanyProfile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CompanyProfileMapper {
    void insertDefault(@Param("userId") Long userId);

    CompanyProfile findByUserId(@Param("userId") Long userId);
}
