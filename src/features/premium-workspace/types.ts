import type { Database } from '@/types/database.types'

export type ChequeRow = Database['public']['Tables']['cheques']['Row']
export type PartyRow = Database['public']['Tables']['parties']['Row']
export type AccountRow = Database['public']['Tables']['accounts']['Row']
export type SavedTool =
  Database['public']['Tables']['premium_workspace_tools']['Row']
export type ToolKind = SavedTool['kind']
export type ImportKind = 'parties' | 'cheques'
export type ImportRow = Record<string, string | number>
export type Issue =
  'required' | 'invalid' | 'duplicate' | 'reference' | 'unknownColumn' | 'limit'
export interface PreviewRow {
  row: number
  data: ImportRow
  issues: { field: string; code: Issue }[]
}
export interface WorkspaceContext {
  parties: PartyRow[]
  accounts: AccountRow[]
  cheques: ChequeRow[]
}
export interface ChequeFilters {
  search?: string
  status?: NonNullable<ChequeRow['status']>
  type?: NonNullable<ChequeRow['type']>
  party_id?: string
  from?: string
  to?: string
}
export interface SafeChequePrefill {
  party_id?: string
  account_id?: string
  amount?: number
  type?: NonNullable<ChequeRow['type']>
  notes?: string
}
export interface WorkspaceSnapshot {
  businesses: { id: string; name: string }[]
  cheques: ChequeRow[]
}
