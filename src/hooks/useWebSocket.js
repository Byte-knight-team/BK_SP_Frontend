import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getAuthToken } from '../utils/authToken'

/**
 * useWebSocket hook
 *
 * Connects to the Spring Boot WebSocket/STOMP endpoint and subscribes
 * to a branch-scoped topic for real-time kitchen alerts.
 *
 * Usage:
 *   useWebSocket(branchId, (alert) => {
 *     // handle incoming alert
 *   })
 *
 * @param {number|string} branchId - The branch ID from the JWT (user.branchId)
 * @param {function}      onAlert  - Callback fired whenever a new alert arrives
 */
export default function useWebSocket(branchId, onAlert) {
  const clientRef = useRef(null)

  // Wrap onAlert in a ref so we never need to recreate the STOMP connection
  // when the callback identity changes (e.g., from a parent re-render)
  const onAlertRef = useRef(onAlert)
  useEffect(() => {
    onAlertRef.current = onAlert
  }, [onAlert])

  const connect = useCallback(() => {
    if (!branchId) return // Don't connect if we don't know the branch yet

    const token = getAuthToken()

    const client = new Client({
      // Use SockJS as the transport factory (matches the backend withSockJS() config)
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

      // Pass the JWT in the STOMP connection headers so the server can identify the user
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },

      // Automatically reconnect if the connection drops (every 5 seconds)
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('[WebSocket] Connected to branch', branchId)

        // Subscribe to the branch-specific kitchen alerts topic
        client.subscribe(`/topic/branch/${branchId}/alerts`, (message) => {
          try {
            const alert = JSON.parse(message.body)
            onAlertRef.current?.(alert)
          } catch (e) {
            console.error('[WebSocket] Failed to parse alert:', e)
          }
        })
      },

      onDisconnect: () => {
        console.log('[WebSocket] Disconnected')
      },

      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers['message'])
      },
    })

    client.activate()
    clientRef.current = client
  }, [branchId])

  useEffect(() => {
    connect()

    // Cleanup: deactivate the client when the component unmounts or branchId changes
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate()
        console.log('[WebSocket] Cleaned up connection')
      }
    }
  }, [connect])
}
