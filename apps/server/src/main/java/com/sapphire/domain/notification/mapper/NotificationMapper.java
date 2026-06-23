package com.sapphire.domain.notification.mapper;

import com.sapphire.domain.notification.dto.NotificationCreateParam;
import com.sapphire.domain.notification.dto.NotificationResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationMapper {
    void insert(NotificationCreateParam param);

    List<NotificationResponse> findByUserId(@Param("userId") Long userId);

    Integer countUnread(@Param("userId") Long userId);

    int markRead(@Param("userId") Long userId, @Param("id") Long id);

    int markAllRead(@Param("userId") Long userId);
}
