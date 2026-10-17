import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/types/database.types'
import type { PrintLayout } from '@/features/cheques/lib/print-cheque'
import type {
  ChequeRow,
  ImportKind,
  ImportRow,
  SavedTool,
  ToolKind,
  WorkspaceContext,
  WorkspaceSnapshot,
} from './types'

function unwrap<T>({
  data,
  error,
}: {
  data: T
  error: { message: string } | null
}): NonNullable<T> {
  if (error) throw new Error(error.message)
  return data as NonNullable<T>
}

async function allPages<T>(
  fetch: (
    from: number,
    to: number,
  ) => PromiseLike<{
    data: T[] | null
    error: { message: string } | null
  }>,
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += 500) {
    const page = unwrap(await fetch(from, from + 499))
    rows.push(...page)
    if (page.length < 500) return rows
  }
}

export const premiumWorkspaceService = {
  async context(businessId: string): Promise<WorkspaceContext> {
    const db = createClient()
    // Core reads remain free; paid execution is always a fresh RPC check.
    const [parties, accounts, cheques] = await Promise.all([
      allPages((from, to) =>
        db
          .from('parties')
          .select('*')
          .eq('business_id', businessId)
          .eq('is_draft', false)
          .is('deleted_at', null)
          .order('id')
          .range(from, to),
      ),
      allPages((from, to) =>
        db
          .from('accounts')
          .select('*')
          .eq('business_id', businessId)
          .eq('is_draft', false)
          .is('deleted_at', null)
          .order('id')
          .range(from, to),
      ),
      allPages((from, to) =>
        db
          .from('cheques')
          .select('*')
          .eq('business_id', businessId)
          .eq('is_draft', false)
          .order('cheque_date')
          .order('id')
          .range(from, to),
      ),
    ])
    return { parties, accounts, cheques }
  },
  async tools(businessId: string): Promise<SavedTool[]> {
    return allPages((from, to) =>
      createClient()
        .from('premium_workspace_tools')
        .select('*')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false })
        .order('id')
        .range(from, to),
    )
  },
  async saveTool(
    businessId: string,
    kind: ToolKind,
    name: string,
    payload: Json,
    id?: string,
  ): Promise<SavedTool> {
    return unwrap(
      await createClient().rpc('premium_workspace_save_tool', {
        requested_business: businessId,
        requested_kind: kind,
        requested_name: name,
        requested_payload: payload,
        ...(id ? { requested_id: id } : {}),
      }),
    )
  },
  async applyTool(id: string): Promise<Json> {
    return unwrap(
      await createClient().rpc('premium_workspace_apply_tool', {
        requested_id: id,
      }),
    )
  },
  async deleteTool(id: string): Promise<void> {
    unwrap(
      await createClient().rpc('premium_workspace_delete_tool', {
        requested_id: id,
      }),
    )
  },
  async importRows(
    businessId: string,
    kind: ImportKind,
    rows: ImportRow[],
  ): Promise<number> {
    return unwrap(
      await createClient().rpc('premium_workspace_import', {
        requested_business: businessId,
        requested_kind: kind,
        requested_rows: rows,
      }),
    )
  },
  async bulkStatus(
    businessId: string,
    ids: string[],
    status: NonNullable<ChequeRow['status']>,
  ): Promise<number> {
    return unwrap(
      await createClient().rpc('premium_workspace_bulk_status', {
        requested_business: businessId,
        requested_ids: ids,
        requested_status: status,
      }),
    )
  },
  async snapshot(
    businessIds: string[],
    partyId?: string,
    from?: string,
    to?: string,
  ): Promise<WorkspaceSnapshot> {
    return unwrap(
      await createClient().rpc('premium_workspace_snapshot', {
        requested_businesses: businessIds,
        ...(partyId ? { requested_party: partyId } : {}),
        ...(from ? { requested_from: from } : {}),
        ...(to ? { requested_to: to } : {}),
      }),
    ) as unknown as WorkspaceSnapshot
  },
}

/** Latest updated template for this business. Rejects if entitlement has expired. */
export async function getMessageTemplate(
  businessId?: string,
): Promise<string | null> {
  const { data, error } = await createClient().rpc(
    'premium_workspace_message',
    businessId ? { requested_business: businessId } : {},
  )
  if (error) throw new Error(error.message)
  return data
}

export async function getPrintLayout(
  accountId: string,
): Promise<PrintLayout | null> {
  const { data, error } = await createClient().rpc(
    'premium_workspace_print_layout',
    { requested_account: accountId },
  )
  if (error) throw new Error(error.message)
  return data as unknown as PrintLayout | null
}

export async function savePrintLayout(
  accountId: string,
  layout: PrintLayout,
): Promise<void> {
  unwrap(
    await createClient().rpc('premium_workspace_print_layout', {
      requested_account: accountId,
      requested_layout: { ...layout },
    }),
  )
}
