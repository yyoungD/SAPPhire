package com.sapphire.domain.user.service;

import com.sapphire.domain.auth.mapper.RefreshTokenMapper;
import com.sapphire.domain.user.mapper.UserMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {
    private final UserMapper userMapper;
    private final RefreshTokenMapper refreshTokenMapper;

    public UserServiceImpl(UserMapper userMapper, RefreshTokenMapper refreshTokenMapper) {
        this.userMapper = userMapper;
        this.refreshTokenMapper = refreshTokenMapper;
    }

    @Override
    @Transactional
    public void withdraw(Long userId) {
        int updatedCount = userMapper.withdrawById(userId);
        if (updatedCount == 0) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }
        refreshTokenMapper.deleteByUserId(userId);
    }
}
