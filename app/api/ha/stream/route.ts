import { supabaseServer } from '@/lib/supabaseServer'
import { getHAWebSocket } from '@/lib/ha-websocket'

export const dynamic = 'force-dynamic'

/**
 * Server-Sent Events endpoint for real-time Home Assistant state updates
 */
export async function GET(req: Request) {
  // Authentication guard
  const supabase = supabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized. Please sign in to access real-time updates.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Create SSE stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      console.log(`📡 SSE client connected: ${user.email}`)

      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`
      controller.enqueue(encoder.encode(data))

      // Get Home Assistant WebSocket instance
      const haWs = getHAWebSocket()

      // Subscribe to state changes
      const unsubscribe = haWs.onStateChange((event) => {
        try {
          const message = {
            type: 'state_changed',
            entity_id: event.data.entity_id,
            new_state: event.data.new_state,
            old_state: event.data.old_state,
            timestamp: new Date().toISOString(),
          }

          const data = `data: ${JSON.stringify(message)}\n\n`
          controller.enqueue(encoder.encode(data))
        } catch (error) {
          console.error('Error sending SSE message:', error)
        }
      })

      // Send periodic heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `: heartbeat\n\n`
          controller.enqueue(encoder.encode(heartbeat))
        } catch (error) {
          console.error('Error sending heartbeat:', error)
          clearInterval(heartbeatInterval)
        }
      }, 30000) // Every 30 seconds

      // Cleanup on connection close
      req.signal.addEventListener('abort', () => {
        console.log(`📡 SSE client disconnected: ${user.email}`)
        clearInterval(heartbeatInterval)
        unsubscribe()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  })
}
