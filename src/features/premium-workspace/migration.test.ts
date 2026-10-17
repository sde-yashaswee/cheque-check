// Structural regression checks complement (not replace) applying the migration to local Postgres.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import en from '../../../messages/en.json'
import hiEn from '../../../messages/hi-en.json'
import hi from '../../../messages/hi.json'

const sql = readFileSync(
  'supabase\\migrations\\20261017030000_premium_workspace.sql',
  'utf8',
)

describe('premium workspace migration boundaries', () => {
  it('does not restrict free core cheque, party or account CRUD', () => {
    expect(sql).not.toMatch(/ALTER TABLE public\.(cheques|parties|accounts)\b/)
    expect(sql).not.toMatch(
      /CREATE POLICY[\s\S]*?ON public\.(cheques|parties|accounts)\s/,
    )
  })
  it('revokes public execution and grants authenticated access on every external RPC', () => {
    for (const name of [
      'save_tool',
      'apply_tool',
      'delete_tool',
      'message',
      'import',
      'bulk_status',
      'snapshot',
      'print_layout',
    ]) {
      expect(sql).toContain(
        `REVOKE ALL ON FUNCTION public.premium_workspace_${name}(`,
      )
      expect(sql).toContain(
        `GRANT EXECUTE ON FUNCTION public.premium_workspace_${name}(`,
      )
    }
  })
  it('retains account-owned stored records after expiry and reserves mutations for validating RPCs', () => {
    expect(sql).toContain(
      'FOR SELECT TO authenticated USING (user_id = auth.uid())',
    )
    expect(sql).toContain(
      'REVOKE ALL ON public.premium_workspace_tools FROM anon, authenticated',
    )
    expect(sql).toContain(
      'GRANT SELECT ON public.premium_workspace_tools TO authenticated',
    )
    expect(sql).not.toMatch(
      /GRANT (INSERT|UPDATE|DELETE|ALL) ON public\.premium_workspace_/,
    )
  })
  it('locks batches and rejects foreign, draft, repeated and opposite-direction status changes', () => {
    expect(sql).toContain('ORDER BY id FOR UPDATE')
    expect(sql).toContain('item.is_draft')
    expect(sql).toContain('item.status = requested_status')
    expect(sql).toContain(
      "requested_status = 'Issued' AND item.type <> 'Outward'",
    )
    expect(sql).toContain(
      "requested_status = 'Received' AND item.type <> 'Inward'",
    )
    expect(sql).toContain('IF n <> cardinality(requested_ids)')
  })
  it('validates entitlement and ownership, creates no quota consumer and catches duplicate imports atomically', () => {
    expect(sql).toContain('NOT public.has_lifetime_premium()')
    expect(sql).toContain('user_id = auth.uid() AND deleted_at IS NULL')
    expect(sql).toContain("RAISE EXCEPTION 'Duplicate cheque in row %'")
    expect(sql).not.toMatch(/consume.*quota|service_role|EXCEPTION WHEN/)
  })
})

function keys(value: object, prefix = ''): string[] {
  return Object.entries(value)
    .flatMap(([key, nested]) =>
      typeof nested === 'object'
        ? keys(nested, `${prefix}${key}.`)
        : [`${prefix}${key}`],
    )
    .sort()
}
describe('workspace localization', () => {
  it('has the same complete translation keys in all three catalogs', () => {
    expect(keys(hi.PremiumWorkspace)).toEqual(keys(en.PremiumWorkspace))
    expect(keys(hiEn.PremiumWorkspace)).toEqual(keys(en.PremiumWorkspace))
  })
})
