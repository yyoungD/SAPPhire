package com.sapphire.domain.notification.service;

import com.sapphire.domain.notification.dto.NotificationCreateParam;
import com.sapphire.domain.notification.dto.NotificationResponse;
import com.sapphire.domain.notification.dto.NotificationUnreadCountResponse;
import com.sapphire.domain.notification.mapper.NotificationMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {
    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(NotificationMapper notificationMapper) {
        this.notificationMapper = notificationMapper;
    }

    @Override
    public void create(NotificationCreateParam param) {
        notificationMapper.insert(param);
    }

    @Override
    public List<NotificationResponse> findNotifications(Long userId) {
        return notificationMapper.findByUserId(userId);
    }

    @Override
    public NotificationUnreadCountResponse countUnread(Long userId) {
        return new NotificationUnreadCountResponse(notificationMapper.countUnread(userId));
    }

    @Override
    @Transactional
    public void markRead(Long userId, Long id) {
        int updated = notificationMapper.markRead(userId, id);
        if (updated == 0) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Notification not found.");
        }
    }

    @Override
    @Transactional
    public void markAllRead(Long userId) {
        notificationMapper.markAllRead(userId);
    }
}
