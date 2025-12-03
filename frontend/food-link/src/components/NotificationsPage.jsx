import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Bell, AlertCircle, Trash2, Clock, Tag, Building2 } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.error("Please login to view notifications");
      navigate("/login");
      return;
    }
    fetchNotifications();
  }, [token, navigate]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.NOTIFICATIONS.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "donation_claimed":
        return <Bell className="w-5 h-5 text-green-600" strokeWidth={1.5} />;
      case "donation_deleted":
        return <Trash2 className="w-5 h-5 text-red-600" strokeWidth={1.5} />;
      case "donation_unclaimed":
        return <AlertCircle className="w-5 h-5 text-yellow-600" strokeWidth={1.5} />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" strokeWidth={1.5} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-16 bg-white rounded"></div>
            <div className="h-16 bg-white rounded"></div>
            <div className="h-16 bg-white rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              No notifications
            </h2>
            <p className="text-sm text-gray-600">
              You're all caught up! Notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  p-5 transition-colors cursor-pointer hover:bg-gray-50
                  ${!notification.isRead ? 'bg-green-50/30' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" strokeWidth={2} />
                        {formatDate(notification.createdAt)}
                      </span>
                      {notification.donationId && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Tag className="w-3 h-3" strokeWidth={2} />
                          {notification.donationId}
                        </span>
                      )}
                      {notification.metadata?.ngoName && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Building2 className="w-3 h-3" strokeWidth={2} />
                          {notification.metadata.ngoName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
