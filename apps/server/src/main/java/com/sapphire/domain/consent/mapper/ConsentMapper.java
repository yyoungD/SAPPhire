package com.sapphire.domain.consent.mapper;

import com.sapphire.domain.consent.dto.UserConsent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Collection;
import java.util.List;

@Mapper
public interface ConsentMapper {
    List<Long> findRequiredTermIds();

    int countActiveTermsByIds(@Param("termIds") Collection<Long> termIds);

    void insertUserConsent(UserConsent userConsent);
}
