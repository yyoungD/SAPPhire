package com.sapphire.domain.user.mapper;

import com.sapphire.domain.user.dto.AdminUserResponse;
import com.sapphire.domain.user.dto.AdminCompanyResponse;
import com.sapphire.domain.user.dto.AdminCompanyDetailResponse;
import com.sapphire.domain.user.dto.AdminUserDetailResponse;
import com.sapphire.domain.user.dto.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {
    boolean existsByEmail(@Param("email") String email);

    User findByEmail(@Param("email") String email);

    User findByEmailIncludingDeleted(@Param("email") String email);

    User findByOAuth(@Param("oauthProvider") String oauthProvider, @Param("oauthId") String oauthId);

    User findById(@Param("id") Long id);

    List<AdminUserResponse> findAdminUsers();

    AdminUserDetailResponse findAdminUserDetail(@Param("id") Long id);

    void insertAdminUserMemo(
            @Param("userId") Long userId,
            @Param("adminUserId") Long adminUserId,
            @Param("content") String content
    );

    List<AdminCompanyResponse> findAdminCompanies();

    AdminCompanyDetailResponse findAdminCompanyDetail(@Param("id") Long id);

    void insert(User user);

    void insertOAuthUser(User user);

    void updateOAuthInfo(User user);

    void updateProfile(User user);

    void restoreOAuthUser(User user);

    int withdrawById(@Param("id") Long id);
}
