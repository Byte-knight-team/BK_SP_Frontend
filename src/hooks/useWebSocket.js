import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getAuthToken } from '../utils/authToken'

/**
 * useWebSocket hook
 *
 * Connects to the Spring Boot WebSocket/STOMP endpoint and subscribes
 * to any branch-scoped topic for real-time notifications.
 *
 * Usage:
 *   useWebSocket(branchId, '/topic/branch/{branchId}/kitchen-orders', (msg) => {
 *     // handle incoming message
 *   })
 *
 * @param {number|string} branchId - The branch ID from the JWT (user.branchId)
 * @param {string}        topic    - The full STOMP topic to subscribe to
 * @param {function}      onMessage - Callback fired whenever a new message arrives
 */
export default function useWebSocket(branchId, topic, onMessage) {
  const clientRef = useRef(null)

  // Wrap onMessage in a ref so we never need to recreate the STOMP connection
  // when the callback identity changes (e.g. from a parent re-render)
  const onMessageRef = useRef(onMessage)
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const connect = useCallback(() => {
    if (!branchId || !topic) return // Don't connect if branch or topic is unknown

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
        console.log('[WebSocket] Connected — subscribing to', topic)

        // Subscribe to the given topic and fire the callback on each message
        client.subscribe(topic, (message) => {
          try {
            const parsed = JSON.parse(message.body)
            onMessageRef.current?.(parsed)
          } catch (e) {
            console.error('[WebSocket] Failed to parse message:', e)
          }
        })
      },

      onDisconnect: () => {
        console.log('[WebSocket] Disconnected from', topic)
      },

      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers['message'])
      },
    })

    client.activate()
    clientRef.current = client
  }, [branchId, topic])

  useEffect(() => {
    connect()

    // Cleanup: deactivate the client when the component unmounts or topic changes
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate()
        console.log('[WebSocket] Cleaned up connection for', topic)
      }
    }
  }, [connect])
}
