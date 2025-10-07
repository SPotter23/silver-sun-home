/**
 * Request validation utilities
 */

/**
 * Validate Home Assistant entity_id format
 * Format: domain.object_id (e.g., light.living_room)
 */
export function isValidEntityId(entityId: string): boolean {
  if (!entityId || typeof entityId !== 'string') {
    return false
  }

  // Must contain exactly one dot
  const parts = entityId.split('.')
  if (parts.length !== 2) {
    return false
  }

  const [domain, objectId] = parts

  // Domain and object_id must be non-empty
  if (!domain || !objectId) {
    return false
  }

  // Only lowercase letters, numbers, and underscores allowed
  const validPattern = /^[a-z0-9_]+$/
  return validPattern.test(domain) && validPattern.test(objectId)
}

/**
 * Validate Home Assistant domain
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false
  }

  // Common HA domains
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

  return validDomains.includes(domain)
}

/**
 * Validate service name
 */
export function isValidService(service: string): boolean {
  if (!service || typeof service !== 'string') {
    return false
  }

  // Only lowercase letters, numbers, and underscores allowed
  const validPattern = /^[a-z0-9_]+$/
  return validPattern.test(service)
}

/**
 * Sanitize string input (remove potential injection characters)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Remove control characters and potentially dangerous characters
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Control characters
    .replace(/[<>'"`;()]/g, '') // Potentially dangerous chars
    .trim()
}

/**
 * Validate service call data object
 */
export function isValidServiceData(data: unknown): boolean {
  if (data === null || data === undefined) {
    return true // Optional
  }

  if (typeof data !== 'object' || Array.isArray(data)) {
    return false
  }

  // Recursively check all values are primitives or nested objects
  const isValidValue = (value: unknown): boolean => {
    if (value === null || value === undefined) {
      return true
    }

    const type = typeof value
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return true
    }

    if (type === 'object') {
      if (Array.isArray(value)) {
        return value.every(isValidValue)
      }
      return Object.values(value).every(isValidValue)
    }

    return false
  }

  return Object.values(data).every(isValidValue)
}
