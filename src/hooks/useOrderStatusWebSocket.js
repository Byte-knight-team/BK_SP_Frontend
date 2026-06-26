import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getAuthToken } from '../utils/authToken'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * useOrderStatusWebSocket hook
 *
 * Connects to the Spring Boot WebSocket/STOMP endpoint and subscribes
 * to a specific order's topic for real-time status updates.
 *
 * Usage:
 *   useOrderStatusWebSocket(orderId, (update) => {
 *     // handle incoming status update
 *   })
 *
 * @param {number|string} orderId - The ID of the order to track
 * @param {function}      onUpdate  - Callback fired whenever a new status update arrives
 */
export default function useOrderStatusWebSocket(orderId, onUpdate) {
  const clientRef = useRef(null)

  // Wrap onUpdate in a ref so we never need to recreate the STOMP connection
  // when the callback identity changes (e.g., from a parent re-render)
  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  const connect = useCallback(() => {
    if (!orderId) return // Don't connect if we don't know the order ID yet

    const token = getAuthToken()

    const client = new Client({
      // Use SockJS as the transport factory
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),

      // Pass the JWT in the STOMP connection headers
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },

      // Automatically reconnect if the connection drops (every 5 seconds)
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('[WebSocket] Connected to order topic for order', orderId)

        // Subscribe to the specific order's status topic
        client.subscribe(`/topic/order/${orderId}/status`, (message) => {
          try {
            const update = JSON.parse(message.body)
            onUpdateRef.current?.(update)
          } catch (e) {
            console.error('[WebSocket] Failed to parse order status update:', e)
          }
        })
      },

      onDisconnect: () => {
        console.log('[WebSocket] Disconnected from order topic')
      },

      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers['message'])
      },
    })

    client.activate()
    clientRef.current = client
  }, [orderId])

  useEffect(() => {
    connect()

    // Cleanup: deactivate the client when the component unmounts or orderId changes
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate()
        console.log('[WebSocket] Cleaned up order topic connection')
      }
    }
  }, [connect])
}
