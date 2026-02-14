/**
 * Mock Notification Service
 * Simulates sending notifications to different roles (Receptionist, Customer)
 */

const NOTIFICATION_LOG_KEY = 'mock_notifications_log';

export const notificationService = {
    /**
     * Send a notification to a specific role or user
     * @param {string} recipient - 'receptionist', 'customer', or specific user ID
     * @param {string} type - 'cancellation', 'status_update', etc.
     * @param {object} payload - Additional details (orderId, mealId, reason, etc.)
     */
    sendNotification: (recipient, type, payload) => {
        const notification = {
            id: Date.now(),
            recipient,
            type,
            payload,
            timestamp: new Date().toISOString(),
            read: false
        };

        // Log to console for debugging
        console.group('🔔 Mock Notification Sent');
        console.log(`To: ${recipient}`);
        console.log(`Type: ${type}`);
        console.log('Payload:', payload);
        console.groupEnd();

        // Store in localStorage for verification during demo/dev
        try {
            const existingLogs = JSON.parse(localStorage.getItem(NOTIFICATION_LOG_KEY) || '[]');
            const updatedLogs = [notification, ...existingLogs].slice(0, 50); // Keep last 50
            localStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify(updatedLogs));
        } catch (error) {
            console.warn('Failed to save notification to localStorage:', error);
        }

        return Promise.resolve({ success: true, notificationId: notification.id });
    },

    /**
     * Get notification history from localStorage
     */
    getHistory: () => {
        try {
            return JSON.parse(localStorage.getItem(NOTIFICATION_LOG_KEY) || '[]');
        } catch {
            return [];
        }
    },

    /**
     * Clear notification history
     */
    clearHistory: () => {
        localStorage.removeItem(NOTIFICATION_LOG_KEY);
    }
};
