import { useEffect, useRef, useState } from 'react';
import { notificationApi } from '../../api/notificationApi.js';
import { navigate } from '../../utils/authUtils.js';

function formatNotificationDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  async function loadUnreadCount() {
    try {
      const data = await notificationApi.unreadCount();
      setUnreadCount(data?.unreadCount ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }

  async function loadNotifications() {
    setIsLoading(true);
    try {
      const data = await notificationApi.list();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUnreadCount();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function toggleNotifications() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      await loadNotifications();
    }
  }

  async function handleNotificationClick(notification) {
    if (!notification.read) {
      await notificationApi.markRead(notification.id);
      await loadUnreadCount();
    }
    setIsOpen(false);
    if (notification.targetUrl) {
      navigate(notification.targetUrl);
    }
  }

  async function handleMarkAllRead() {
    await notificationApi.markAllRead();
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
  }

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="member-icon-button company-notification-button"
        aria-label="알림"
        aria-expanded={isOpen}
        onClick={toggleNotifications}
      >
        <span />
        <strong className="notification-count-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </strong>
      </button>

      {isOpen && (
        <div className="notification-dropdown" role="dialog" aria-label="알림 목록">
          <div className="notification-dropdown-header">
            <strong>알림</strong>
            <button type="button" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              모두 읽음
            </button>
          </div>

          <div className="notification-dropdown-list">
            {isLoading && <p className="notification-empty">알림을 불러오는 중입니다.</p>}
            {!isLoading && notifications.length === 0 && (
              <p className="notification-empty">알림이 없습니다.</p>
            )}
            {!isLoading &&
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span className="notification-item-dot" />
                  <span className="notification-item-content">
                    <strong>{notification.title}</strong>
                    {notification.message && <em>{notification.message}</em>}
                    <small>{formatNotificationDate(notification.createdAt)}</small>
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
