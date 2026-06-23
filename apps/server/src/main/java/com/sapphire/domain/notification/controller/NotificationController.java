package com.sapphire.domain.notification.controller;

import com.sapphire.domain.notification.dto.NotificationResponse;
import com.sapphire.domain.notification.dto.NotificationUnreadCountResponse;
import com.sapphire.domain.notification.service.NotificationService;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> findNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.findNotifications(userDetails.getId())));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<NotificationUnreadCountResponse>> countUnread(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.countUnread(userDetails.getId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        notificationService.markRead(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        notificationService.markAllRead(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
