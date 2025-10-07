export interface HAEntityAttributes {
  friendly_name?: string
  [key: string]: any
}

export interface HAEntity {
  entity_id: string
  state: string
  attributes: HAEntityAttributes
  domain: string
  last_changed?: string
  last_updated?: string
}

export interface HAServiceCall {
  domain: string
  service: string
  entity_id: string
  data?: Record<string, any>
}

export interface HAErrorResponse {
  error: string
}
