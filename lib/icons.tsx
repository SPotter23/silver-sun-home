/**
 * Simple icon components for Home Assistant entity domains
 * Using Unicode symbols for simplicity (no dependencies)
 */

interface IconProps {
  className?: string
}

export function LightIcon({ className = '' }: IconProps) {
  return <span className={className}>💡</span>
}

export function SwitchIcon({ className = '' }: IconProps) {
  return <span className={className}>🔌</span>
}

export function SensorIcon({ className = '' }: IconProps) {
  return <span className={className}>📊</span>
}

export function ClimateIcon({ className = '' }: IconProps) {
  return <span className={className}>🌡️</span>
}

export function CoverIcon({ className = '' }: IconProps) {
  return <span className={className}>🪟</span>
}

export function LockIcon({ className = '' }: IconProps) {
  return <span className={className}>🔒</span>
}

export function MediaPlayerIcon({ className = '' }: IconProps) {
  return <span className={className}>📺</span>
}

export function FanIcon({ className = '' }: IconProps) {
  return <span className={className}>🌀</span>
}

export function VacuumIcon({ className = '' }: IconProps) {
  return <span className={className}>🧹</span>
}

export function CameraIcon({ className = '' }: IconProps) {
  return <span className={className}>📷</span>
}

export function DefaultIcon({ className = '' }: IconProps) {
  return <span className={className}>⚡</span>
}

/**
 * Get appropriate icon component for entity domain
 */
export function getEntityIcon(domain: string): React.FC<IconProps> {
  switch (domain) {
    case 'light':
      return LightIcon
    case 'switch':
      return SwitchIcon
    case 'sensor':
    case 'binary_sensor':
      return SensorIcon
    case 'climate':
      return ClimateIcon
    case 'cover':
      return CoverIcon
    case 'lock':
      return LockIcon
    case 'media_player':
      return MediaPlayerIcon
    case 'fan':
      return FanIcon
    case 'vacuum':
      return VacuumIcon
    case 'camera':
      return CameraIcon
    default:
      return DefaultIcon
  }
}
