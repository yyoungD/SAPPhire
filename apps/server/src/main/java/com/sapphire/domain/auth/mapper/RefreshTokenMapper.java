package com.sapphire.domain.auth.mapper;

import com.sapphire.domain.auth.domain.RefreshToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RefreshTokenMapper {
    RefreshToken findByRefreshToken(@Param("refreshToken") String refreshToken);

    void upsert(RefreshToken refreshToken);

    void deleteByUserId(@Param("userId") Long userId);

    void deleteByRefreshToken(@Param("refreshToken") String refreshToken);
}
