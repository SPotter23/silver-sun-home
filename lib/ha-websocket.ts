/**
 * Home Assistant WebSocket Client
 * Connects to HA WebSocket API and streams state changes
 */

import WebSocket from 'ws'
import { env } from './env'

interface HAMessage {
  id?: number
  type: string
  [key: string]: any
}

interface StateChangedEvent {
  event_type: 'state_changed'
  data: {
    entity_id: string
    new_state: any
    old_state: any
  }
}

type MessageHandler = (message: HAMessage) => void
type StateChangeHandler = (event: StateChangedEvent) => void

export class HomeAssistantWebSocket {
  private ws: WebSocket | null = null
  private messageId = 1
  private authenticated = false
  private reconnectTimeout: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 5000
  private messageHandlers: Map<number, MessageHandler> = new Map()
  private stateChangeHandlers: Set<StateChangeHandler> = new Set()

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      // Convert HTTP(S) URL to WS(S) URL
      const wsUrl = env.HA_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://')

      this.ws = new WebSocket(`${wsUrl}/api/websocket`)

      this.ws.on('open', () => {
        console.log('✅ Connected to Home Assistant WebSocket')
        this.reconnectAttempts = 0
      })

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message: HAMessage = JSON.parse(data.toString())
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      })

      this.ws.on('close', () => {
        console.log('⚠️  Home Assistant WebSocket closed')
        this.authenticated = false
        this.scheduleReconnect()
      })

      this.ws.on('error', (error) => {
        console.error('❌ Home Assistant WebSocket error:', error)
        this.authenticated = false
      })
    } catch (error) {
      console.error('Failed to connect to Home Assistant WebSocket:', error)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Giving up.')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private handleMessage(message: HAMessage) {
    // Handle authentication request
    if (message.type === 'auth_required') {
      this.authenticate()
      return
    }

    // Handle authentication result
    if (message.type === 'auth_ok') {
      console.log('✅ Authenticated with Home Assistant')
      this.authenticated = true
      this.subscribeToStateChanges()
      return
    }

    if (message.type === 'auth_invalid') {
      console.error('❌ Authentication failed:', message)
      return
    }

    // Handle state changed events
    if (message.type === 'event' && message.event?.event_type === 'state_changed') {
      this.stateChangeHandlers.forEach(handler => {
        try {
          handler(message.event as StateChangedEvent)
        } catch (error) {
          console.error('State change handler error:', error)
        }
      })
      return
    }

    // Handle responses with ID
    if (message.id && this.messageHandlers.has(message.id)) {
      const handler = this.messageHandlers.get(message.id)!
      handler(message)
      this.messageHandlers.delete(message.id)
    }
  }

  private authenticate() {
    this.send({
      type: 'auth',
      access_token: env.HA_TOKEN,
    })
  }

  private subscribeToStateChanges() {
    this.sendWithResponse({
      type: 'subscribe_events',
      event_type: 'state_changed',
    })
  }

  private send(message: HAMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return
    }

    this.ws.send(JSON.stringify(message))
  }

  private sendWithResponse(message: HAMessage): Promise<HAMessage> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++
      const messageWithId = { ...message, id }

      const timeout = setTimeout(() => {
        this.messageHandlers.delete(id)
        reject(new Error('Request timeout'))
      }, 10000)

      this.messageHandlers.set(id, (response) => {
        clearTimeout(timeout)
        resolve(response)
      })

      this.send(messageWithId)
    })
  }

  /**
   * Subscribe to state change events
   */
  public onStateChange(handler: StateChangeHandler): () => void {
    this.stateChangeHandlers.add(handler)

    // Return unsubscribe function
    return () => {
      this.stateChangeHandlers.delete(handler)
    }
  }

  /**
   * Check if connected and authenticated
   */
  public isConnected(): boolean {
    return this.ws !== null &&
           this.ws.readyState === WebSocket.OPEN &&
           this.authenticated
  }

  /**
   * Close the WebSocket connection
   */
  public close() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.stateChangeHandlers.clear()
    this.messageHandlers.clear()
  }
}

// Singleton instance
let haWebSocket: HomeAssistantWebSocket | null = null

export function getHAWebSocket(): HomeAssistantWebSocket {
  if (!haWebSocket) {
    haWebSocket = new HomeAssistantWebSocket()
  }
  return haWebSocket
}
