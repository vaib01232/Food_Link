import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Bell, Trash2, CheckCircle, XCircle } from "lucide-react";
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
      console.error("Error fetching notifications:", error);
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
      console.error("Error marking notification as read:", error);
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
      console.error("Error marking all as read:", error);
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
        return "🎉";
      case "donation_deleted":
        return "🗑️";
      default:
        return "📢";
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 pt-20 px-4">
        <div className="max-w-4xl mx-auto p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-green-200 rounded w-1/4"></div>
            <div className="h-20 bg-white rounded-xl"></div>
            <div className="h-20 bg-white rounded-xl"></div>
            <div className="h-20 bg-white rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-gray-600 mt-2">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No notifications yet
            </h2>
            <p className="text-gray-600">
              When you receive notifications, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  bg-white rounded-xl p-6 shadow-md cursor-pointer 
                  transition-all duration-300 hover:scale-[1.01] hover:shadow-lg
                  ${!notification.isRead ? 'border-l-4 border-green-600' : 'border-l-4 border-transparent'}
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className={`text-gray-800 ${!notification.isRead ? 'font-semibold' : 'font-normal'}`}>
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></span>
                      )}
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        🕒 {formatDate(notification.createdAt)}
                      </span>
                      {notification.donationId && (
                        <span className="flex items-center gap-1">
                          📦 {notification.donationId}
                        </span>
                      )}
                      {notification.metadata?.ngoName && (
                        <span className="flex items-center gap-1">
                          🏢 {notification.metadata.ngoName}
                        </span>
                      )}
                    </div>
                  </div>
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
