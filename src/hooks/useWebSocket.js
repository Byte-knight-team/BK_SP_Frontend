import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getAuthToken } from '../utils/authToken'

/**
 * useWebSocket hook
 *
 * Connects to the Spring Boot WebSocket/STOMP endpoint and subscribes
 * to one or more branch-scoped topics for real-time notifications.
 *
 * Usage (single topic):
 *   useWebSocket(branchId, '/topic/branch/{branchId}/alerts', (msg) => { ... })
 *
 * Usage (multiple topics, one connection):
 *   useWebSocket(branchId, ['/topic/branch/{branchId}/orders', '/topic/branch/{branchId}/tables'], (msg) => { ... })
 *
 * @param {number|string}        branchId  - The branch ID from the JWT (user.branchId)
 * @param {string|string[]}      topic     - One topic string or an array of topic strings
 * @param {function}             onMessage - Callback fired for every incoming message on any subscribed topic
 */
export default function useWebSocket(branchId, topic, onMessage) {
  const clientRef = useRef(null)

  const onMessageRef = useRef(onMessage)
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const topics = Array.isArray(topic) ? topic : topic ? [topic] : []
  const topicKey = topics.join(',')

  const connect = useCallback(() => {
    if (!branchId || topics.length === 0) return

    const token = getAuthToken()

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('[WebSocket] Connected — subscribing to', topics)
        topics.forEach((t) => {
          client.subscribe(t, (message) => {
            try {
              const parsed = JSON.parse(message.body)
              onMessageRef.current?.(parsed, t)
            } catch (e) {
              console.error('[WebSocket] Failed to parse message:', e)
            }
          })
        })
      },

      onDisconnect: () => {
        console.log('[WebSocket] Disconnected from', topics)
      },

      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers['message'])
      },
    })

    client.activate()
    clientRef.current = client
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, topicKey])

  useEffect(() => {
    connect()
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate()
        console.log('[WebSocket] Cleaned up connection for', topics)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect])
}
