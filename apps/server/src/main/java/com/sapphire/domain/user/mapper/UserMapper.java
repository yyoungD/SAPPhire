package com.sapphire.domain.user.mapper;

import com.sapphire.domain.user.dto.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    boolean existsByEmail(@Param("email") String email);

    User findByEmail(@Param("email") String email);

    User findById(@Param("id") Long id);

    void insert(User user);

    void insertOAuthUser(User user);

    void updateOAuthInfo(User user);
}
