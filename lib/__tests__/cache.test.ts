/**
 * Unit tests for cache utilities
 * Target: 85%+ code coverage
 */

import { cache } from '../cache'

// Helper to wait for a specified time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('SimpleCache', () => {
  // Clear cache before each test to ensure isolation
  beforeEach(() => {
    cache.clear()
  })

  describe('set and get operations', () => {
    it('should store and retrieve data', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1', 60000)).toBe('value1')
    })

    it('should store different data types', () => {
      cache.set('string', 'text')
      cache.set('number', 123)
      cache.set('boolean', true)
      cache.set('object', { key: 'value' })
      cache.set('array', [1, 2, 3])
      cache.set('null', null)

      expect(cache.get('string', 60000)).toBe('text')
      expect(cache.get('number', 60000)).toBe(123)
      expect(cache.get('boolean', 60000)).toBe(true)
      expect(cache.get('object', 60000)).toEqual({ key: 'value' })
      expect(cache.get('array', 60000)).toEqual([1, 2, 3])
      expect(cache.get('null', 60000)).toBeNull()
    })

    it('should overwrite existing keys', () => {
      cache.set('key1', 'original')
      cache.set('key1', 'updated')
      expect(cache.get('key1', 60000)).toBe('updated')
    })

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent', 60000)).toBeNull()
    })

    it('should handle multiple keys independently', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      expect(cache.get('key1', 60000)).toBe('value1')
      expect(cache.get('key2', 60000)).toBe('value2')
      expect(cache.get('key3', 60000)).toBe('value3')
    })
  })

  describe('expiration and TTL', () => {
    it('should return null for expired entries', async () => {
      cache.set('key1', 'value1')

      // Wait for expiration (100ms maxAge, wait 150ms)
      await wait(150)

      expect(cache.get('key1', 100)).toBeNull()
    })

    it('should return data within TTL', async () => {
      cache.set('key1', 'value1')

      // Wait less than maxAge
      await wait(50)

      expect(cache.get('key1', 100)).toBe('value1')
    })

    it('should delete expired entries on access', async () => {
      cache.set('key1', 'value1')

      // Wait for expiration
      await wait(150)

      // This should delete the expired entry
      cache.get('key1', 100)

      // Verify it was deleted (by checking with a very long maxAge)
      expect(cache.get('key1', 999999)).toBeNull()
    })

    it('should respect different maxAge values', async () => {
      cache.set('key1', 'value1')

      // Should be valid with long maxAge
      expect(cache.get('key1', 60000)).toBe('value1')

      // Wait a tiny bit to ensure age > 0
      await wait(10)

      // Should be expired with very short maxAge
      expect(cache.get('key1', 5)).toBeNull()
    })

    it('should handle maxAge of 0 (immediate expiration)', async () => {
      cache.set('key1', 'value1')

      // Wait a tiny bit to ensure age > 0
      await wait(10)

      expect(cache.get('key1', 0)).toBeNull()
    })

    it('should handle very large maxAge values', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1', Number.MAX_SAFE_INTEGER)).toBe('value1')
    })

    it('should properly track age for multiple entries', async () => {
      cache.set('key1', 'value1')
      await wait(100)
      cache.set('key2', 'value2')

      // key1 is older, should expire first
      expect(cache.get('key1', 80)).toBeNull()
      expect(cache.get('key2', 80)).toBe('value2')
    })
  })

  describe('clear operations', () => {
    it('should clear a specific key', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      cache.clear('key1')

      expect(cache.get('key1', 60000)).toBeNull()
      expect(cache.get('key2', 60000)).toBe('value2')
    })

    it('should clear all keys when no argument provided', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      cache.clear()

      expect(cache.get('key1', 60000)).toBeNull()
      expect(cache.get('key2', 60000)).toBeNull()
      expect(cache.get('key3', 60000)).toBeNull()
    })

    it('should not error when clearing non-existent key', () => {
      expect(() => cache.clear('nonexistent')).not.toThrow()
    })

    it('should allow re-adding after clearing', () => {
      cache.set('key1', 'value1')
      cache.clear('key1')
      cache.set('key1', 'new value')

      expect(cache.get('key1', 60000)).toBe('new value')
    })
  })

  describe('pattern-based invalidation', () => {
    beforeEach(() => {
      cache.set('entities:all', [])
      cache.set('entities:light', [])
      cache.set('entities:switch', [])
      cache.set('services:light', [])
      cache.set('services:switch', [])
      cache.set('config:general', {})
    })

    it('should invalidate keys matching pattern', () => {
      cache.invalidate('entities:')

      expect(cache.get('entities:all', 60000)).toBeNull()
      expect(cache.get('entities:light', 60000)).toBeNull()
      expect(cache.get('entities:switch', 60000)).toBeNull()
      expect(cache.get('services:light', 60000)).toEqual([])
      expect(cache.get('services:switch', 60000)).toEqual([])
    })

    it('should support regex patterns', () => {
      cache.invalidate('entities:(light|switch)')

      expect(cache.get('entities:light', 60000)).toBeNull()
      expect(cache.get('entities:switch', 60000)).toBeNull()
      expect(cache.get('entities:all', 60000)).toEqual([])
    })

    it('should invalidate all with wildcard pattern', () => {
      cache.invalidate('.*')

      expect(cache.get('entities:all', 60000)).toBeNull()
      expect(cache.get('services:light', 60000)).toBeNull()
      expect(cache.get('config:general', 60000)).toBeNull()
    })

    it('should handle patterns matching no keys', () => {
      expect(() => cache.invalidate('nonexistent:')).not.toThrow()

      // All original keys should still exist
      expect(cache.get('entities:all', 60000)).toEqual([])
      expect(cache.get('services:light', 60000)).toEqual([])
    })

    it('should handle complex regex patterns', () => {
      cache.invalidate('^entities:')

      expect(cache.get('entities:all', 60000)).toBeNull()
      expect(cache.get('entities:light', 60000)).toBeNull()
      expect(cache.get('services:light', 60000)).toEqual([])
    })

    it('should handle partial matches', () => {
      cache.invalidate('light')

      expect(cache.get('entities:light', 60000)).toBeNull()
      expect(cache.get('services:light', 60000)).toBeNull()
      expect(cache.get('entities:switch', 60000)).toEqual([])
    })

    it('should handle case-sensitive patterns', () => {
      cache.invalidate('ENTITIES')

      // Should not match (pattern is case-sensitive)
      expect(cache.get('entities:all', 60000)).toEqual([])
    })
  })

  describe('edge cases and type safety', () => {
    it('should handle empty string keys', () => {
      cache.set('', 'value')
      expect(cache.get('', 60000)).toBe('value')
    })

    it('should handle keys with special characters', () => {
      cache.set('key:with:colons', 'value1')
      cache.set('key.with.dots', 'value2')
      cache.set('key-with-dashes', 'value3')
      cache.set('key_with_underscores', 'value4')

      expect(cache.get('key:with:colons', 60000)).toBe('value1')
      expect(cache.get('key.with.dots', 60000)).toBe('value2')
      expect(cache.get('key-with-dashes', 60000)).toBe('value3')
      expect(cache.get('key_with_underscores', 60000)).toBe('value4')
    })

    it('should handle very long keys', () => {
      const longKey = 'k'.repeat(1000)
      cache.set(longKey, 'value')
      expect(cache.get(longKey, 60000)).toBe('value')
    })

    it('should handle large data values', () => {
      const largeArray = Array(10000).fill('data')
      cache.set('large', largeArray)
      expect(cache.get('large', 60000)).toEqual(largeArray)
    })

    it('should handle undefined values', () => {
      cache.set('key', undefined)
      expect(cache.get('key', 60000)).toBeUndefined()
    })

    it('should handle objects with nested structures', () => {
      const complex = {
        level1: {
          level2: {
            level3: {
              data: [1, 2, 3],
              nested: { value: true }
            }
          }
        }
      }

      cache.set('complex', complex)
      expect(cache.get('complex', 60000)).toEqual(complex)
    })
  })

  describe('concurrency and timing', () => {
    it('should handle rapid consecutive sets', () => {
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, `value${i}`)
      }

      for (let i = 0; i < 100; i++) {
        expect(cache.get(`key${i}`, 60000)).toBe(`value${i}`)
      }
    })

    it('should handle rapid consecutive gets', () => {
      cache.set('key', 'value')

      for (let i = 0; i < 100; i++) {
        expect(cache.get('key', 60000)).toBe('value')
      }
    })

    it('should maintain data integrity during mixed operations', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear('key1')
      cache.set('key3', 'value3')
      cache.invalidate('key2')

      expect(cache.get('key1', 60000)).toBeNull()
      expect(cache.get('key2', 60000)).toBeNull()
      expect(cache.get('key3', 60000)).toBe('value3')
    })
  })

  describe('memory management', () => {
    it('should properly cleanup after clearing all', () => {
      // Add many entries
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, `value${i}`)
      }

      // Clear all
      cache.clear()

      // Should be able to add new entries
      cache.set('newkey', 'newvalue')
      expect(cache.get('newkey', 60000)).toBe('newvalue')
    })

    it('should remove expired entries to free memory', async () => {
      cache.set('key1', 'value1')

      // Wait for expiration
      await wait(150)

      // Access to trigger deletion
      cache.get('key1', 100)

      // Verify memory was freed by adding new key with same name
      cache.set('key1', 'newvalue')
      expect(cache.get('key1', 60000)).toBe('newvalue')
    })
  })

  describe('real-world usage scenarios', () => {
    it('should cache API responses', () => {
      const apiResponse = {
        entities: [
          { id: 'light.1', state: 'on' },
          { id: 'light.2', state: 'off' }
        ],
        timestamp: Date.now()
      }

      cache.set('api:entities', apiResponse)

      const cached = cache.get<typeof apiResponse>('api:entities', 60000)
      expect(cached).toEqual(apiResponse)
    })

    it('should invalidate related cache entries', () => {
      cache.set('entities:all', ['light.1', 'light.2'])
      cache.set('entities:light', ['light.1'])
      cache.set('entities:switch', ['switch.1'])

      // Invalidate all entity caches
      cache.invalidate('^entities:')

      expect(cache.get('entities:all', 60000)).toBeNull()
      expect(cache.get('entities:light', 60000)).toBeNull()
      expect(cache.get('entities:switch', 60000)).toBeNull()
    })

    it('should handle cache-aside pattern', () => {
      // First request - cache miss
      let value = cache.get<string>('user:123', 5000)
      if (!value) {
        value = 'user data from DB'
        cache.set('user:123', value)
      }

      expect(value).toBe('user data from DB')

      // Second request - cache hit
      const cachedValue = cache.get<string>('user:123', 5000)
      expect(cachedValue).toBe('user data from DB')
    })
  })
})
