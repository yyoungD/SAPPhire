package com.sapphire.domain.notification.service;

import com.sapphire.domain.notification.dto.NotificationCreateParam;
import com.sapphire.domain.notification.dto.NotificationResponse;
import com.sapphire.domain.notification.dto.NotificationUnreadCountResponse;

import java.util.List;

public interface NotificationService {
    void create(NotificationCreateParam param);

    List<NotificationResponse> findNotifications(Long userId);

    NotificationUnreadCountResponse countUnread(Long userId);

    void markRead(Long userId, Long id);

    void markAllRead(Long userId);
}
