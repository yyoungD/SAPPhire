package com.sapphire.domain.profile.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CompanyProfileMapper {
    void insertDefault(@Param("userId") Long userId);

    void insertSignupProfile(
            @Param("userId") Long userId,
            @Param("companyName") String companyName,
            @Param("businessNumber") String businessNumber,
            @Param("verificationStatus") String verificationStatus
    );
}
