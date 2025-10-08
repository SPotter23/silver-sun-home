# Testing Strategy

## Current Test Coverage

### E2E Tests (Playwright)
- ✅ Authentication flows
- ✅ Entity display
- ✅ Search and filtering
- ✅ API health checks

**Status**: Basic E2E coverage in place

---

## Recommended Unit Tests

### High Priority - Core Business Logic

#### 1. Input Validation (`lib/validation.ts`)

**Why Critical:**
- Security boundary - prevents injection attacks
- Complex regex patterns easy to break
- Domain whitelist changes frequently

**Test Cases:**
```typescript
// lib/__tests__/validation.test.ts

describe('isValidEntityId', () => {
  it('should accept valid entity IDs', () => {
    expect(isValidEntityId('light.living_room')).toBe(true)
    expect(isValidEntityId('switch.kitchen_outlet')).toBe(true)
  })

  it('should reject invalid formats', () => {
    expect(isValidEntityId('light')).toBe(false)
    expect(isValidEntityId('light.')).toBe(false)
    expect(isValidEntityId('.living_room')).toBe(false)
    expect(isValidEntityId('light..living_room')).toBe(false)
  })

  it('should reject injection attempts', () => {
    expect(isValidEntityId('light.room; DROP TABLE')).toBe(false)
    expect(isValidEntityId('light.room<script>')).toBe(false)
    expect(isValidEntityId('../../../etc/passwd')).toBe(false)
  })
})

describe('isValidDomain', () => {
  it('should accept whitelisted domains', () => {
    expect(isValidDomain('light')).toBe(true)
    expect(isValidDomain('switch')).toBe(true)
  })

  it('should reject non-whitelisted domains', () => {
    expect(isValidDomain('malicious')).toBe(false)
    expect(isValidDomain('admin')).toBe(false)
  })

  it('should be case-sensitive', () => {
    expect(isValidDomain('LIGHT')).toBe(false)
  })
})

describe('isValidServiceData', () => {
  it('should accept valid nested data', () => {
    expect(isValidServiceData({ brightness: 255 })).toBe(true)
    expect(isValidServiceData({ rgb_color: [255, 0, 0] })).toBe(true)
  })

  it('should reject dangerous data', () => {
    expect(isValidServiceData({ __proto__: {} })).toBe(false)
    expect(isValidServiceData({ constructor: {} })).toBe(false)
  })

  it('should handle deeply nested objects', () => {
    const deep = { level1: { level2: { level3: 'value' } } }
    expect(isValidServiceData(deep)).toBe(true)
  })
})
```

**Impact**: Prevents security vulnerabilities - **CRITICAL**

---

#### 2. Rate Limiting (`lib/rate-limit.ts`)

**Why Critical:**
- DoS protection depends on this
- Time-based logic prone to edge cases
- Cleanup logic needs testing

**Test Cases:**
```typescript
// lib/__tests__/rate-limit.test.ts

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset rate limit state
  })

  it('should allow requests within limit', () => {
    const result = checkRateLimit('test-ip', {
      maxRequests: 10,
      windowMs: 60000,
    })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(9)
  })

  it('should block requests over limit', () => {
    // Make 10 requests
    for (let i = 0; i < 10; i++) {
      checkRateLimit('test-ip', { maxRequests: 10, windowMs: 60000 })
    }

    // 11th request should fail
    const result = checkRateLimit('test-ip', {
      maxRequests: 10,
      windowMs: 60000,
    })
    expect(result.success).toBe(false)
  })

  it('should reset after window expires', async () => {
    // Make request
    checkRateLimit('test-ip', { maxRequests: 1, windowMs: 100 })

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150))

    // Should allow new request
    const result = checkRateLimit('test-ip', {
      maxRequests: 1,
      windowMs: 100,
    })
    expect(result.success).toBe(true)
  })

  it('should track different IPs separately', () => {
    checkRateLimit('ip1', { maxRequests: 1, windowMs: 60000 })

    const result = checkRateLimit('ip2', {
      maxRequests: 1,
      windowMs: 60000,
    })
    expect(result.success).toBe(true)
  })

  it('should cleanup expired entries', () => {
    // Test memory leak prevention
  })
})
```

**Impact**: Ensures DoS protection works - **HIGH**

---

#### 3. Caching (`lib/cache.ts`)

**Why Important:**
- Performance optimization
- Cache invalidation is hard
- TTL logic needs verification

**Test Cases:**
```typescript
// lib/__tests__/cache.test.ts

describe('SimpleCache', () => {
  let cache: SimpleCache

  beforeEach(() => {
    cache = new SimpleCache()
  })

  it('should cache and retrieve data', () => {
    cache.set('key1', { data: 'value' })
    expect(cache.get('key1', 60000)).toEqual({ data: 'value' })
  })

  it('should return null for expired data', async () => {
    cache.set('key1', 'value')

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(cache.get('key1', 100)).toBeNull()
  })

  it('should respect maxAge parameter', () => {
    const now = Date.now()
    cache.set('key1', 'value')

    // Should be valid with long maxAge
    expect(cache.get('key1', 60000)).toBe('value')

    // Should be invalid with short maxAge
    expect(cache.get('key1', 0)).toBeNull()
  })

  it('should invalidate by pattern', () => {
    cache.set('entities:all', [])
    cache.set('entities:light', [])
    cache.set('services:switch', [])

    cache.invalidate('entities:')

    expect(cache.get('entities:all', 60000)).toBeNull()
    expect(cache.get('entities:light', 60000)).toBeNull()
    expect(cache.get('services:switch', 60000)).toBe([])
  })

  it('should clear all cache', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')

    cache.clear()

    expect(cache.get('key1', 60000)).toBeNull()
    expect(cache.get('key2', 60000)).toBeNull()
  })
})
```

**Impact**: Ensures caching works correctly - **MEDIUM**

---

#### 4. Environment Validation (`lib/env.ts`)

**Why Important:**
- Prevents runtime errors from missing config
- Complex validation logic
- Build vs runtime behavior

**Test Cases:**
```typescript
// lib/__tests__/env.test.ts

describe('validateEnv', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should pass with all required variables', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
    process.env.HA_BASE_URL = 'http://192.168.1.100:8123'
    process.env.HA_TOKEN = 'test-token'

    expect(() => validateEnv()).not.toThrow()
  })

  it('should fail with missing variables', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ''

    expect(() => validateEnv()).toThrow('NEXT_PUBLIC_SUPABASE_URL is required')
  })

  it('should validate URL formats', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'invalid-url'

    expect(() => validateEnv()).toThrow('must start with https://')
  })

  it('should warn during build phase', () => {
    process.env.NEXT_PHASE = 'phase-production-build'
    process.env.NEXT_PUBLIC_SUPABASE_URL = ''

    const consoleSpy = jest.spyOn(console, 'warn')
    validateEnv()

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Environment variables not set')
    )
  })
})
```

**Impact**: Prevents deployment failures - **HIGH**

---

### Medium Priority - Utility Functions

#### 5. Icon Mapping (`lib/icons.tsx`)

**Test Cases:**
```typescript
// lib/__tests__/icons.test.ts

describe('getEntityIcon', () => {
  it('should return correct icons for known domains', () => {
    expect(getEntityIcon('light')).toBeDefined()
    expect(getEntityIcon('switch')).toBeDefined()
    expect(getEntityIcon('climate')).toBeDefined()
  })

  it('should return default icon for unknown domains', () => {
    const defaultIcon = getEntityIcon('unknown_domain')
    expect(defaultIcon).toBeDefined()
  })

  it('should return same icon for same domain', () => {
    const icon1 = getEntityIcon('light')
    const icon2 = getEntityIcon('light')
    expect(icon1).toBe(icon2)
  })
})
```

---

#### 6. WebSocket Client (`lib/ha-websocket.ts`)

**Why Important:**
- Complex state management
- Reconnection logic critical
- Message handling needs testing

**Test Cases:**
```typescript
// lib/__tests__/ha-websocket.test.ts

describe('HomeAssistantWebSocket', () => {
  let ws: HomeAssistantWebSocket
  let mockWebSocket: any

  beforeEach(() => {
    // Mock WebSocket
    mockWebSocket = {
      on: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
      readyState: WebSocket.OPEN,
    }

    global.WebSocket = jest.fn(() => mockWebSocket)
  })

  it('should connect on initialization', () => {
    ws = new HomeAssistantWebSocket()
    expect(global.WebSocket).toHaveBeenCalled()
  })

  it('should authenticate after connection', () => {
    ws = new HomeAssistantWebSocket()

    // Simulate auth_required message
    const handler = mockWebSocket.on.mock.calls.find(
      call => call[0] === 'message'
    )[1]

    handler(JSON.stringify({ type: 'auth_required' }))

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      expect.stringContaining('auth')
    )
  })

  it('should handle state changes', () => {
    ws = new HomeAssistantWebSocket()
    const handler = jest.fn()

    ws.onStateChange(handler)

    // Simulate state_changed event
    const messageHandler = mockWebSocket.on.mock.calls.find(
      call => call[0] === 'message'
    )[1]

    messageHandler(JSON.stringify({
      type: 'event',
      event: {
        event_type: 'state_changed',
        data: { entity_id: 'light.test' }
      }
    }))

    expect(handler).toHaveBeenCalled()
  })

  it('should reconnect on disconnect', async () => {
    ws = new HomeAssistantWebSocket()

    // Simulate disconnect
    const closeHandler = mockWebSocket.on.mock.calls.find(
      call => call[0] === 'close'
    )[1]

    closeHandler()

    // Should attempt reconnection
    await new Promise(resolve => setTimeout(resolve, 6000))
    expect(global.WebSocket).toHaveBeenCalledTimes(2)
  })
})
```

**Impact**: Ensures real-time reliability - **HIGH**

---

### Low Priority - React Hooks

#### 7. Custom Hooks

**Test Cases:**
```typescript
// hooks/__tests__/useEntities.test.ts
// hooks/__tests__/useRealtimeEntities.test.ts

// Use @testing-library/react-hooks
import { renderHook, waitFor } from '@testing-library/react'

describe('useEntities', () => {
  it('should fetch entities on mount', async () => {
    const { result } = renderHook(() => useEntities())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.entities).toBeDefined()
  })

  it('should refetch when called', async () => {
    const { result } = renderHook(() => useEntities())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await result.current.refetch()

    expect(result.current.loading).toBe(true)
  })
})
```

**Impact**: Ensures hook reliability - **MEDIUM**

---

## Test Setup Requirements

### Install Dependencies

```bash
# Unit testing framework
pnpm add -D jest @types/jest ts-jest

# React testing utilities
pnpm add -D @testing-library/react @testing-library/react-hooks
pnpm add -D @testing-library/jest-dom

# WebSocket mocking
pnpm add -D mock-socket
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    'hooks/**/*.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

## Coverage Goals

### By Priority

| Component | Target Coverage | Priority |
|-----------|----------------|----------|
| `lib/validation.ts` | 100% | Critical |
| `lib/rate-limit.ts` | 95% | High |
| `lib/env.ts` | 90% | High |
| `lib/ha-websocket.ts` | 85% | High |
| `lib/cache.ts` | 85% | Medium |
| `lib/icons.tsx` | 50% | Low |
| `hooks/*.ts` | 70% | Medium |

### Overall Project Goal

- **Critical paths**: 95%+ coverage
- **Business logic**: 80%+ coverage
- **Overall**: 75%+ coverage

---

## Testing Strategy Recommendations

### What to Test

✅ **Do Test:**
- Pure functions (validation, formatting)
- Business logic (rate limiting, caching)
- Error handling paths
- Edge cases and boundary conditions
- Security-critical code

❌ **Don't Test:**
- Next.js framework code
- Third-party libraries
- Simple getters/setters
- Type definitions
- Constant definitions

### Test Organization

```
lib/
├── validation.ts
├── rate-limit.ts
├── cache.ts
└── __tests__/
    ├── validation.test.ts
    ├── rate-limit.test.ts
    └── cache.test.ts

hooks/
├── useEntities.ts
├── useRealtimeEntities.ts
└── __tests__/
    ├── useEntities.test.ts
    └── useRealtimeEntities.test.ts
```

---

## Integration with CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install
      - run: npm run test:e2e
```

### Pre-commit Hook

```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm run test --bail --findRelatedTests
```

---

## Implementation Priority

### Phase 1 (Week 1) - Critical Security
1. ✅ Install Jest and setup
2. ✅ Test `lib/validation.ts` (100% coverage)
3. ✅ Test `lib/rate-limit.ts` (95% coverage)
4. ✅ Test `lib/env.ts` (90% coverage)

### Phase 2 (Week 2) - Core Functionality
5. ✅ Test `lib/cache.ts`
6. ✅ Test `lib/ha-websocket.ts`
7. ✅ Add CI/CD integration

### Phase 3 (Week 3) - React Layer
8. ✅ Test custom hooks
9. ✅ Achieve 75% overall coverage
10. ✅ Document testing practices

---

## Conclusion

**Most Critical Tests:**
1. **Input Validation** - Prevents security vulnerabilities
2. **Rate Limiting** - Prevents DoS attacks
3. **Environment Validation** - Prevents deployment failures
4. **WebSocket Client** - Ensures real-time reliability

**Recommended Starting Point:**
Focus on `lib/validation.ts` first - it's the security boundary and relatively easy to test (pure functions, no external dependencies).

**Expected Benefits:**
- 🛡️ Prevent security regressions
- 🐛 Catch bugs before production
- 📝 Living documentation
- 🔄 Safe refactoring
- ⚡ Faster development (less manual testing)

**Time Investment:**
- Initial setup: ~4 hours
- Phase 1 tests: ~8 hours
- Phase 2 tests: ~12 hours
- Total: ~24 hours for comprehensive coverage

**ROI**: High - prevents production incidents and enables confident refactoring
