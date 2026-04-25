export interface HierarchyLevel {
  key: string
  label: string
  pluralLabel: string
  icon?: string
}

export interface HierarchyConfig {
  clientId: string
  separator: string
  levels: HierarchyLevel[]
  updatedAt: string
}

export interface OrgUnit {
  level: HierarchyLevel
  value: string
  path: string[]
  totalPoints: number
  totalDevices: number
  activePoints: number
  inactivePoints: number
}
