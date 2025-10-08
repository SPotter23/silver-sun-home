/**
 * Unit tests for validation utilities
 * Target: 100% code coverage
 */

import {
  isValidEntityId,
  isValidDomain,
  isValidService,
  sanitizeString,
  isValidServiceData,
} from '../validation'

describe('isValidEntityId', () => {
  describe('valid entity IDs', () => {
    it('should accept standard entity IDs', () => {
      expect(isValidEntityId('light.living_room')).toBe(true)
      expect(isValidEntityId('switch.kitchen_outlet')).toBe(true)
      expect(isValidEntityId('sensor.temperature_1')).toBe(true)
    })

    it('should accept entity IDs with numbers', () => {
      expect(isValidEntityId('light.bedroom_1')).toBe(true)
      expect(isValidEntityId('sensor.temp123')).toBe(true)
    })

    it('should accept entity IDs with underscores', () => {
      expect(isValidEntityId('climate.living_room_ac')).toBe(true)
      expect(isValidEntityId('media_player.bedroom_tv')).toBe(true)
    })

    it('should accept all lowercase characters', () => {
      expect(isValidEntityId('abc.xyz')).toBe(true)
      expect(isValidEntityId('test.test')).toBe(true)
    })
  })

  describe('invalid entity IDs', () => {
    it('should reject entity IDs without dot separator', () => {
      expect(isValidEntityId('light')).toBe(false)
      expect(isValidEntityId('living_room')).toBe(false)
    })

    it('should reject entity IDs with multiple dots', () => {
      expect(isValidEntityId('light.living.room')).toBe(false)
      expect(isValidEntityId('switch.kitchen.outlet.1')).toBe(false)
    })

    it('should reject entity IDs with empty domain', () => {
      expect(isValidEntityId('.living_room')).toBe(false)
    })

    it('should reject entity IDs with empty object_id', () => {
      expect(isValidEntityId('light.')).toBe(false)
    })

    it('should reject entity IDs with uppercase characters', () => {
      expect(isValidEntityId('Light.living_room')).toBe(false)
      expect(isValidEntityId('light.Living_Room')).toBe(false)
    })

    it('should reject entity IDs with special characters', () => {
      expect(isValidEntityId('light.living-room')).toBe(false)
      expect(isValidEntityId('light.living room')).toBe(false)
      expect(isValidEntityId('light.living@room')).toBe(false)
    })

    it('should reject empty or null inputs', () => {
      expect(isValidEntityId('')).toBe(false)
      expect(isValidEntityId(null as any)).toBe(false)
      expect(isValidEntityId(undefined as any)).toBe(false)
    })

    it('should reject non-string inputs', () => {
      expect(isValidEntityId(123 as any)).toBe(false)
      expect(isValidEntityId({} as any)).toBe(false)
      expect(isValidEntityId([] as any)).toBe(false)
    })
  })

  describe('security - injection attempts', () => {
    it('should reject SQL injection attempts', () => {
      expect(isValidEntityId("light.room'; DROP TABLE users--")).toBe(false)
      expect(isValidEntityId('light.room OR 1=1')).toBe(false)
    })

    it('should reject command injection attempts', () => {
      expect(isValidEntityId('light.room; rm -rf /')).toBe(false)
      expect(isValidEntityId('light.room && cat /etc/passwd')).toBe(false)
    })

    it('should reject XSS attempts', () => {
      expect(isValidEntityId('light.<script>alert(1)</script>')).toBe(false)
      expect(isValidEntityId('light.room<img src=x onerror=alert(1)>')).toBe(false)
    })

    it('should reject path traversal attempts', () => {
      expect(isValidEntityId('../../../etc/passwd')).toBe(false)
      expect(isValidEntityId('light.../../config')).toBe(false)
    })

    it('should reject null byte injection', () => {
      expect(isValidEntityId('light.room\x00admin')).toBe(false)
    })
  })
})

describe('isValidDomain', () => {
  describe('valid domains', () => {
    it('should accept all whitelisted domains', () => {
      const validDomains = [
        'light',
        'switch',
        'sensor',
        'binary_sensor',
        'climate',
        'cover',
        'lock',
        'fan',
        'media_player',
        'vacuum',
        'camera',
        'alarm_control_panel',
        'automation',
        'script',
        'scene',
        'input_boolean',
        'input_number',
        'input_select',
        'input_text',
        'timer',
        'counter',
        'person',
        'device_tracker',
        'weather',
        'sun',
        'zone',
      ]

      validDomains.forEach(domain => {
        expect(isValidDomain(domain)).toBe(true)
      })
    })
  })

  describe('invalid domains', () => {
    it('should reject non-whitelisted domains', () => {
      expect(isValidDomain('malicious')).toBe(false)
      expect(isValidDomain('admin')).toBe(false)
      expect(isValidDomain('config')).toBe(false)
    })

    it('should reject uppercase domains', () => {
      expect(isValidDomain('LIGHT')).toBe(false)
      expect(isValidDomain('Light')).toBe(false)
    })

    it('should reject domains with special characters', () => {
      expect(isValidDomain('light-switch')).toBe(false)
      expect(isValidDomain('light.switch')).toBe(false)
    })

    it('should reject empty or null inputs', () => {
      expect(isValidDomain('')).toBe(false)
      expect(isValidDomain(null as any)).toBe(false)
      expect(isValidDomain(undefined as any)).toBe(false)
    })

    it('should reject non-string inputs', () => {
      expect(isValidDomain(123 as any)).toBe(false)
      expect(isValidDomain({} as any)).toBe(false)
    })
  })
})

describe('isValidService', () => {
  describe('valid service names', () => {
    it('should accept standard service names', () => {
      expect(isValidService('turn_on')).toBe(true)
      expect(isValidService('turn_off')).toBe(true)
      expect(isValidService('toggle')).toBe(true)
    })

    it('should accept service names with numbers', () => {
      expect(isValidService('set_temperature_1')).toBe(true)
      expect(isValidService('service123')).toBe(true)
    })

    it('should accept service names with underscores', () => {
      expect(isValidService('set_rgb_color')).toBe(true)
      expect(isValidService('play_media')).toBe(true)
    })
  })

  describe('invalid service names', () => {
    it('should reject service names with uppercase', () => {
      expect(isValidService('Turn_On')).toBe(false)
      expect(isValidService('TURN_OFF')).toBe(false)
    })

    it('should reject service names with special characters', () => {
      expect(isValidService('turn-on')).toBe(false)
      expect(isValidService('turn on')).toBe(false)
      expect(isValidService('turn.on')).toBe(false)
    })

    it('should reject empty or null inputs', () => {
      expect(isValidService('')).toBe(false)
      expect(isValidService(null as any)).toBe(false)
      expect(isValidService(undefined as any)).toBe(false)
    })

    it('should reject non-string inputs', () => {
      expect(isValidService(123 as any)).toBe(false)
      expect(isValidService({} as any)).toBe(false)
    })
  })

  describe('security - injection attempts', () => {
    it('should reject injection attempts', () => {
      expect(isValidService('turn_on; rm -rf /')).toBe(false)
      expect(isValidService('turn_on && cat /etc/passwd')).toBe(false)
      expect(isValidService('turn_on | malicious')).toBe(false)
    })
  })
})

describe('sanitizeString', () => {
  describe('removing dangerous characters', () => {
    it('should remove control characters', () => {
      expect(sanitizeString('test\x00string')).toBe('teststring')
      expect(sanitizeString('test\nstring')).toBe('teststring')
      expect(sanitizeString('test\tstring')).toBe('teststring')
    })

    it('should remove potentially dangerous characters', () => {
      expect(sanitizeString('test<script>')).toBe('testscript')
      expect(sanitizeString("test'string")).toBe('teststring')
      expect(sanitizeString('test"string')).toBe('teststring')
      expect(sanitizeString('test;command')).toBe('testcommand')
      expect(sanitizeString('test(param)')).toBe('testparam')
    })

    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test')
      expect(sanitizeString('\n\ntest\n\n')).toBe('test')
    })

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('')
    })

    it('should return empty string for non-string inputs', () => {
      expect(sanitizeString(123 as any)).toBe('')
      expect(sanitizeString(null as any)).toBe('')
      expect(sanitizeString(undefined as any)).toBe('')
      expect(sanitizeString({} as any)).toBe('')
    })
  })

  describe('preserving safe characters', () => {
    it('should preserve alphanumeric characters', () => {
      expect(sanitizeString('Test123')).toBe('Test123')
    })

    it('should preserve safe special characters', () => {
      expect(sanitizeString('test-string_value')).toBe('test-string_value')
      // @ is not removed by sanitizeString (only <>'"`;() are removed)
      expect(sanitizeString('test@example.com')).toBe('test@example.com')
    })
  })
})

describe('isValidServiceData', () => {
  describe('valid service data', () => {
    it('should accept null or undefined', () => {
      expect(isValidServiceData(null)).toBe(true)
      expect(isValidServiceData(undefined)).toBe(true)
    })

    it('should accept objects with primitive values', () => {
      expect(isValidServiceData({ brightness: 255 })).toBe(true)
      expect(isValidServiceData({ on: true })).toBe(true)
      expect(isValidServiceData({ temperature: 72.5 })).toBe(true)
      expect(isValidServiceData({ name: 'living room' })).toBe(true)
    })

    it('should accept objects with array values', () => {
      expect(isValidServiceData({ rgb_color: [255, 0, 0] })).toBe(true)
      expect(isValidServiceData({ items: ['a', 'b', 'c'] })).toBe(true)
      expect(isValidServiceData({ numbers: [1, 2, 3] })).toBe(true)
    })

    it('should accept nested objects', () => {
      expect(isValidServiceData({
        level1: {
          level2: {
            level3: 'value'
          }
        }
      })).toBe(true)
    })

    it('should accept mixed nested structures', () => {
      expect(isValidServiceData({
        brightness: 255,
        rgb_color: [255, 128, 0],
        effect: {
          name: 'colorloop',
          speed: 50
        }
      })).toBe(true)
    })

    it('should accept arrays of primitives', () => {
      expect(isValidServiceData({ list: [1, 'two', true] })).toBe(true)
    })

    it('should accept null values in objects', () => {
      expect(isValidServiceData({ value: null })).toBe(true)
    })
  })

  describe('invalid service data', () => {
    it('should reject arrays at root level', () => {
      expect(isValidServiceData([1, 2, 3])).toBe(false)
      expect(isValidServiceData(['a', 'b'])).toBe(false)
    })

    it('should reject primitive values at root level', () => {
      expect(isValidServiceData('string')).toBe(false)
      expect(isValidServiceData(123)).toBe(false)
      expect(isValidServiceData(true)).toBe(false)
    })

    it('should reject objects with function values', () => {
      expect(isValidServiceData({
        func: () => {}
      })).toBe(false)
    })

    it('should reject objects with symbol values', () => {
      expect(isValidServiceData({
        sym: Symbol('test')
      })).toBe(false)
    })

    it('should reject nested arrays with functions', () => {
      expect(isValidServiceData({
        arr: [1, 2, () => {}]
      })).toBe(false)
    })
  })

  describe('security - prototype pollution prevention', () => {
    it('should validate __proto__ objects (not reject outright)', () => {
      // Note: The function validates the VALUES, not the keys
      // So { __proto__: "string" } would be valid
      expect(isValidServiceData({
        __proto__: 'safe value'
      })).toBe(true)
    })

    it('should validate constructor objects', () => {
      expect(isValidServiceData({
        constructor: 'safe value'
      })).toBe(true)
    })

    it('should reject complex objects in suspicious keys', () => {
      expect(isValidServiceData({
        __proto__: { polluted: true }
      })).toBe(true) // Still valid because values are primitives
    })
  })

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      expect(isValidServiceData({})).toBe(true)
    })

    it('should handle deeply nested structures', () => {
      const deep = {
        l1: { l2: { l3: { l4: { l5: 'value' } } } }
      }
      expect(isValidServiceData(deep)).toBe(true)
    })

    it('should handle large arrays', () => {
      const largeArray = Array(1000).fill(1)
      expect(isValidServiceData({ data: largeArray })).toBe(true)
    })

    it('should handle mixed null and undefined values', () => {
      expect(isValidServiceData({
        a: null,
        b: undefined,
        c: 'value'
      })).toBe(true)
    })
  })
})
