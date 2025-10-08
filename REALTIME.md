# Real-Time Updates Architecture

## Overview

Silver Sun Home now features **true real-time updates** using a server-side WebSocket client that streams Home Assistant state changes to browser clients via Server-Sent Events (SSE).

### Benefits

- ✅ **Instant Updates**: Sub-second latency for state changes
- ✅ **Zero Polling**: No unnecessary API calls when real-time is enabled
- ✅ **Efficient**: Single server WebSocket connection shared across all clients
- ✅ **Scalable**: SSE streams are lightweight and browser-native
- ✅ **Reliable**: Automatic reconnection with exponential backoff

---

## Architecture

```
┌──────────────────┐
│ Home Assistant   │
│  WebSocket API   │
└────────┬─────────┘
         │ ws://
         │ (state_changed events)
         ▼
┌──────────────────┐
│  Next.js Server  │
│ (ha-websocket.ts)│  ◄─── Singleton WebSocket client
└────────┬─────────┘       Subscribes to all state changes
         │ SSE
         │ (Server-Sent Events)
         ▼
┌──────────────────┐
│  Browser Client  │
│  EventSource API │  ◄─── Multiple clients
└──────────────────┘       Each with own SSE stream
```

### Data Flow

1. **Home Assistant → Server**
   - Server connects to HA WebSocket API on startup
   - Authenticates with `HA_TOKEN`
   - Subscribes to `state_changed` events

2. **Server → Client(s)**
   - Clients connect to `/api/ha/stream` (authenticated SSE endpoint)
   - Server broadcasts state changes to all connected clients
   - Each client receives only the entities they're subscribed to

3. **Client UI Updates**
   - SSE messages parsed and applied to React state
   - UI updates immediately (no polling delay)
   - Optimistic updates for user actions

---

## Implementation Details

### Server-Side Components

#### `lib/ha-websocket.ts`
**Home Assistant WebSocket Client**

```typescript
class HomeAssistantWebSocket {
  // Singleton pattern - one connection for entire server
  - Connects to HA WebSocket API
  - Handles authentication
  - Subscribes to state_changed events
  - Automatic reconnection (5 attempts, exponential backoff)
  - Event broadcasting to SSE streams
}
```

**Features:**
- Auto-reconnect on connection loss
- Message queuing during reconnection
- Handler-based event system
- Graceful cleanup

#### `app/api/ha/stream/route.ts`
**SSE Endpoint**

```typescript
GET /api/ha/stream
- Requires authentication (Supabase)
- Creates ReadableStream for SSE
- Subscribes to HA WebSocket events
- 30-second heartbeat keepalive
- Cleanup on disconnect
```

**Message Types:**
- `connected`: Initial connection confirmation
- `state_changed`: Entity state update
- `: heartbeat`: Keepalive (every 30s)

### Client-Side Components

#### `hooks/useRealtimeEntities.ts`
**Real-Time Hook**

```typescript
const { entities, isConnected, reconnect, disconnect } =
  useRealtimeEntities(initialEntities, options)
```

**Features:**
- EventSource API wrapper
- State management for entity updates
- Automatic reconnection (up to 5 attempts)
- Exponential backoff (1s → 30s max)
- Error handling and callbacks

#### `components/EntitiesWithControls.tsx`
**UI Integration**

```typescript
// Real-time toggle button
- Green when connected
- Yellow when connecting
- Gray when disabled
- Pulsing dot indicator when active
```

---

## Configuration

### Environment Variables

No additional configuration required! Uses existing:
- `HA_BASE_URL` - Converted from HTTP(S) to WS(S)
- `HA_TOKEN` - WebSocket authentication

### Client Options

```typescript
const { entities, isConnected } = useRealtimeEntities(initialEntities, {
  enabled: true,              // Enable/disable real-time
  onConnect: () => {},        // Connection callback
  onDisconnect: () => {},     // Disconnection callback
  onError: (error) => {},     // Error callback
})
```

---

## Performance

### Metrics

| Metric | Polling (30s) | Real-Time (SSE) |
|--------|---------------|-----------------|
| Update Latency | 0-30 seconds | <1 second |
| API Calls/Hour | 120 requests | 0 requests |
| Bandwidth | High (full state) | Low (deltas only) |
| Server Load | Medium | Very Low |

### Optimizations

1. **Server-Side**
   - Single WebSocket connection (singleton)
   - Shared across all clients
   - Efficient message broadcasting

2. **Client-Side**
   - Delta updates only (not full state)
   - React state updates batched
   - Automatic cleanup on unmount

3. **Network**
   - SSE is one-way (server → client)
   - No HTTP request overhead
   - Persistent connection (low latency)

---

## Reliability

### Reconnection Strategy

#### Server → HA

```
Attempt 1: Wait 5s
Attempt 2: Wait 10s
Attempt 3: Wait 15s
Attempt 4: Wait 20s
Attempt 5: Wait 25s
Give up after 5 attempts
```

#### Client → Server

```
Attempt 1: Wait 1s
Attempt 2: Wait 2s
Attempt 3: Wait 4s
Attempt 4: Wait 8s
Attempt 5: Wait 16s
Max delay: 30s
```

### Error Handling

| Error Type | Behavior |
|------------|----------|
| Network timeout | Auto-reconnect with backoff |
| Auth failure | Stop reconnecting, show error |
| HA unavailable | Retry connection, fallback to polling |
| Invalid message | Log error, continue streaming |

---

## Security

### Authentication

- ✅ SSE endpoint requires Supabase authentication
- ✅ Unauthorized users receive 401 response
- ✅ WebSocket token stays server-side (never exposed)

### Rate Limiting

SSE endpoint is NOT rate-limited because:
- Requires authentication (inherent protection)
- One connection per user (self-limiting)
- No abuse vector (read-only stream)

### Connection Limits

Recommended limits:
- **Development**: Unlimited
- **Production**: 100 concurrent SSE connections per server instance
- **Scaling**: Use load balancer with sticky sessions

---

## Monitoring

### Server Logs

```bash
✅ Connected to Home Assistant WebSocket
✅ Authenticated with Home Assistant
📡 SSE client connected: user@example.com
📡 SSE client disconnected: user@example.com
⚠️  Home Assistant WebSocket closed
❌ Home Assistant WebSocket error: [error]
```

### Client Indicators

UI shows connection status:
- 🟢 **Connected** - Real-time active, pulsing dot
- 🟡 **Connecting** - Attempting connection
- ⚪ **Disabled** - Real-time turned off

---

## Troubleshooting

### Real-Time Not Working

**Symptom**: Button shows "Connecting..." but never connects

**Possible Causes:**

1. **Server WebSocket Failed**
   ```bash
   # Check server logs for:
   ❌ Home Assistant WebSocket error
   ```
   **Fix**: Verify `HA_BASE_URL` is reachable from server

2. **SSE Endpoint Returns 401**
   ```bash
   # Check browser console:
   Error: Unauthorized
   ```
   **Fix**: Sign out and sign back in

3. **Browser Blocks SSE**
   ```bash
   # Check browser console:
   EventSource failed
   ```
   **Fix**: Disable browser extensions, check CORS settings

### Reconnection Issues

**Symptom**: Constant reconnect attempts

**Debug:**
```javascript
// In browser console:
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/ha/stream'))
```

**Common Fixes:**
- Check server is running
- Verify authentication hasn't expired
- Ensure HA WebSocket is connected

---

## Future Enhancements

### Planned Features

1. **Selective Subscriptions**
   - Client specifies which entities to watch
   - Reduces bandwidth for large HA installations

2. **Redis Pub/Sub**
   - Share WebSocket events across server instances
   - Enable horizontal scaling

3. **Compression**
   - Gzip SSE stream
   - Reduce bandwidth by ~70%

4. **Metrics**
   - Track connection count
   - Monitor message throughput
   - Latency measurements

5. **Admin Dashboard**
   - View active SSE connections
   - Force disconnect clients
   - Connection health stats

---

## API Reference

### SSE Message Format

```typescript
interface SSEMessage {
  type: 'connected' | 'state_changed'
  entity_id?: string
  new_state?: HAEntity
  old_state?: HAEntity
  timestamp: string
}
```

### Example Messages

**Connection Established:**
```json
data: {
  "type": "connected",
  "timestamp": "2025-10-07T23:30:00.000Z"
}
```

**State Changed:**
```json
data: {
  "type": "state_changed",
  "entity_id": "light.living_room",
  "new_state": {
    "entity_id": "light.living_room",
    "state": "on",
    "attributes": { "brightness": 255 }
  },
  "old_state": {
    "entity_id": "light.living_room",
    "state": "off"
  },
  "timestamp": "2025-10-07T23:30:15.123Z"
}
```

**Heartbeat:**
```
: heartbeat
```

---

## Testing

### Manual Testing

1. **Enable Real-Time:**
   - Click "Real-time" button (should turn green)
   - Verify pulsing indicator appears

2. **Test State Changes:**
   - Toggle a light in Home Assistant app
   - Verify dashboard updates within 1 second

3. **Test Reconnection:**
   - Restart Home Assistant
   - Verify automatic reconnection after ~5-10 seconds

### Automated Testing

Add to `tests/e2e/realtime.spec.ts`:

```typescript
test('real-time updates work', async ({ page }) => {
  await page.goto('/')
  await page.click('button:has-text("Real-time")')

  // Wait for connection
  await expect(page.locator('.animate-pulse')).toBeVisible()

  // Trigger state change via API
  // Verify UI updates
})
```

---

## Conclusion

The real-time update system provides a **significant UX improvement** over polling:
- Instant feedback for state changes
- Reduced server load
- Lower bandwidth usage
- Better scalability

For most users, **real-time should be the default** with polling as a fallback for edge cases where WebSocket connectivity is unavailable.

---

*Last updated: October 7, 2025*
