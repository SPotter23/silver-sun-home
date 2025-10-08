/**
 * Custom hook for real-time entity updates via Server-Sent Events
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { HAEntity } from '@/types/home-assistant'

interface SSEMessage {
  type: 'connected' | 'state_changed'
  entity_id?: string
  new_state?: any
  old_state?: any
  timestamp: string
}

interface UseRealtimeEntitiesOptions {
  enabled?: boolean
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export function useRealtimeEntities(
  initialEntities: HAEntity[],
  options: UseRealtimeEntitiesOptions = {}
) {
  const { enabled = true, onError, onConnect, onDisconnect } = options

  const [entities, setEntities] = useState<HAEntity[]>(initialEntities)
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (!enabled || eventSourceRef.current) return

    try {
      const eventSource = new EventSource('/api/ha/stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('✅ Connected to real-time updates')
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        onConnect?.()
      }

      eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data)

          if (message.type === 'connected') {
            console.log('📡 Real-time stream ready')
          }

          if (message.type === 'state_changed' && message.entity_id && message.new_state) {
            // Update entity in state
            setEntities(prev => {
              const index = prev.findIndex(e => e.entity_id === message.entity_id)

              if (index === -1) {
                // New entity - add it
                return [...prev, {
                  ...message.new_state,
                  domain: message.entity_id!.split('.')[0]
                }]
              }

              // Update existing entity
              const updated = [...prev]
              updated[index] = {
                ...message.new_state,
                domain: message.entity_id!.split('.')[0]
              }
              return updated
            })
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error)
        setIsConnected(false)

        eventSource.close()
        eventSourceRef.current = null

        onDisconnect?.()

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)

          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else {
          console.error('Max reconnection attempts reached')
          onError?.(new Error('Failed to establish real-time connection'))
        }
      }
    } catch (error) {
      console.error('Failed to create EventSource:', error)
      onError?.(error as Error)
    }
  }, [enabled, onConnect, onDisconnect, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }, [])

  // Initialize connection
  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  // Update entities when initialEntities change (e.g., manual refresh)
  useEffect(() => {
    setEntities(initialEntities)
  }, [initialEntities])

  return {
    entities,
    isConnected,
    reconnect: connect,
    disconnect,
  }
}
