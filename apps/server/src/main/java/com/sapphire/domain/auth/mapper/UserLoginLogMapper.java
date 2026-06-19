package com.sapphire.domain.auth.mapper;

import com.sapphire.domain.auth.dto.UserLoginLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserLoginLogMapper {
    void insert(UserLoginLog log);
}
