import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  ClipboardList, 
  CheckCircle2, 
  ChefHat, 
  PartyPopper, 
  PauseCircle, 
  Truck, 
  MapPin, 
  UtensilsCrossed, 
  XCircle, 
  Ban,
  Package
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Friendly status labels for toast messages.
 * Maps backend OrderStatus enum values to user-facing messages.
 */
const STATUS_LABELS = {
  PLACED: { text: 'Order Placed', icon: ClipboardList, type: 'info' },
  PENDING: { text: 'Order Confirmed', icon: CheckCircle2, type: 'success' },
  PREPARING: { text: 'Being Prepared', icon: ChefHat, type: 'info' },
  COMPLETED: { text: 'Ready!', icon: PartyPopper, type: 'success' },
  ON_HOLD: { text: 'On Hold', icon: PauseCircle, type: 'warning' },
  OUT_FOR_DELIVERY: { text: 'Out for Delivery', icon: Truck, type: 'info' },
  ARRIVED: { text: 'Driver Arrived', icon: MapPin, type: 'success' },
  SERVED: { text: 'Served', icon: UtensilsCrossed, type: 'success' },
  CANCELLED: { text: 'Cancelled', icon: XCircle, type: 'error' },
  REJECTED: { text: 'Rejected', icon: Ban, type: 'error' },
};

/**
 * GlobalNotificationProvider
 *
 * Subscribes to /topic/user/{userId}/orders via WebSocket (STOMP)
 * and shows actionable toast notifications for any order status change.
 *
 * Auth-gated: Only connects when a customer JWT exists in localStorage.
 * Disconnects automatically on logout (JWT removal).
 *
 * Place this inside CustomerLayout (wrapping <Outlet />) so it's active
 * on every customer page except checkout.
 */
export default function GlobalNotificationProvider() {
  const clientRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const activeTokenRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('customer_jwt') || localStorage.getItem('qr_session_token');
    
    if (!token) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        activeTokenRef.current = null;
      }
      return;
    }

    if (activeTokenRef.current === token && clientRef.current?.connected) {
      return;
    }

    let userId = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.userId || payload.user_id || payload.sub;
    } catch (e) {
      console.error('[GlobalNotification] Failed to decode JWT', e);
      return;
    }

    if (!userId) return;

    if (clientRef.current) {
      clientRef.current.deactivate();
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => {},
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[GlobalNotification] Connected — subscribing to /topic/user/' + userId + '/orders');

        client.subscribe(`/topic/user/${userId}/orders`, (message) => {
          try {
            const update = JSON.parse(message.body);
            const { orderStatus, orderNumber, orderId } = update;

            if (!orderStatus) return;
            
            // Ignore PLACED status because a local toast is already shown upon placement,
            // and the user is immediately redirected to the confirmation page.
            if (orderStatus === 'PLACED') return;

            const statusInfo = STATUS_LABELS[orderStatus] || {
              text: orderStatus.replace(/_/g, ' '),
              icon: Package,
              type: 'info',
            };

            const displayOrderNumber = orderNumber || `#${orderId}`;

            // Show an actionable toast that navigates to the order when clicked
            const toastFn =
              statusInfo.type === 'success'
                ? toast.success
                : statusInfo.type === 'error'
                  ? toast.error
                  : statusInfo.type === 'warning'
                    ? toast.warning
                    : toast.info;

            const IconComponent = statusInfo.icon;

            toastFn(
              `Order ${displayOrderNumber}: ${statusInfo.text}`,
              {
                icon: <IconComponent size={20} />,
                onClick: () => {
                  navigate('/order-confirmation', { state: { orderId: Number(orderId) } });
                },
                style: { cursor: 'pointer' },
              }
            );
          } catch (error) {
            console.error('[GlobalNotification] Error parsing order message:', error);
          }
        });

        // 2. Subscribe to reservations topic
        console.log('[GlobalNotification] Subscribing to /topic/user/' + userId + '/reservations');
        client.subscribe(`/topic/user/${userId}/reservations`, (message) => {
          try {
            const update = JSON.parse(message.body);
            const { reservationStatus, reservationId } = update;

            if (!reservationStatus) return;

            // Invalidate React Query cache so the modal/page updates immediately
            if (queryClient) {
              queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
              queryClient.invalidateQueries({ queryKey: ['myReservations'] });
            }

            let text = 'Reservation Updated';
            let type = 'info';
            
            if (reservationStatus === 'CONFIRMED') { text = 'Reservation Confirmed! Please pay to secure.'; type = 'success'; }
            if (reservationStatus === 'REJECTED') { text = 'Reservation Rejected'; type = 'error'; }
            if (reservationStatus === 'EXPIRED') { text = 'Reservation Expired'; type = 'error'; }
            if (reservationStatus === 'CANCELLED') { text = 'Reservation Cancelled'; type = 'error'; }

            const toastFn =
              type === 'success'
                ? toast.success
                : type === 'error'
                  ? toast.error
                  : toast.info;

            toastFn(
              `Reservation #${reservationId}: ${text}`,
              {
                icon: <ClipboardList size={20} />,
                onClick: () => {
                  navigate('/reservations', { state: { openReservationId: reservationId } });
                },
                style: { cursor: 'pointer' },
              }
            );
          } catch (e) {
            console.error('[GlobalNotification] Failed to parse reservation update:', e);
          }
        });
      },

      onDisconnect: () => {
        console.log('[GlobalNotification] Disconnected');
      },

      onStompError: (frame) => {
        console.error('[GlobalNotification] STOMP error:', frame.headers?.['message']);
      },
    });

    client.activate();
    clientRef.current = client;

    // Cleanup: disconnect when component unmounts
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        console.log('[GlobalNotification] Cleaned up');
      }
    };
  }, [location.pathname]); // Re-run when navigation happens to catch login/logout changes

  // This component renders nothing — it's a pure side-effect provider
  return null;
}
