import type { Tag, TagEntityType } from '@/types'
import { TABLES } from '@/lib/supabase/tables'
import { SupabaseRepository } from '@/repositories/base.repository'

export interface TagLink {
  tag_id: string
  entity_type: TagEntityType
  entity_id: string
}

export interface ITagRepository {
  getAll(businessId: string): Promise<Tag[]>
  create(input: Pick<Tag, 'business_id' | 'name' | 'color'>): Promise<Tag>
  update(id: string, input: Partial<Pick<Tag, 'name' | 'color'>>): Promise<Tag>
  delete(id: string): Promise<void>
  getForEntity(entityType: TagEntityType, entityId: string): Promise<Tag[]>
  attach(link: TagLink): Promise<void>
  detach(link: TagLink): Promise<void>
}

export class SupabaseTagRepository
  extends SupabaseRepository
  implements ITagRepository
{
  async getAll(businessId: string): Promise<Tag[]> {
    return this.handle(
      this.supabase
        .from(TABLES.TAGS)
        .select('*')
        .eq('business_id', businessId)
        .order('name', { ascending: true }),
    ) as Promise<Tag[]>
  }

  async create(
    input: Pick<Tag, 'business_id' | 'name' | 'color'>,
  ): Promise<Tag> {
    return this.handle(
      this.supabase.from(TABLES.TAGS).insert([input]).select().single(),
    ) as Promise<Tag>
  }

  async update(
    id: string,
    input: Partial<Pick<Tag, 'name' | 'color'>>,
  ): Promise<Tag> {
    return this.handle(
      this.supabase
        .from(TABLES.TAGS)
        .update(input)
        .eq('id', id)
        .select()
        .single(),
    ) as Promise<Tag>
  }

  async delete(id: string): Promise<void> {
    await this.handleVoid(this.supabase.from(TABLES.TAGS).delete().eq('id', id))
  }

  async getForEntity(
    entityType: TagEntityType,
    entityId: string,
  ): Promise<Tag[]> {
    return this.handle(
      this.supabase
        .from(TABLES.ENTITY_TAGS)
        .select('tag:tags(*)')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId),
    ).then((rows) =>
      (rows as unknown as Array<{ tag: Tag }>).map((row) => row.tag),
    )
  }

  async attach(link: TagLink): Promise<void> {
    await this.handleVoid(
      this.supabase.from(TABLES.ENTITY_TAGS).upsert([link], {
        onConflict: 'tag_id,entity_type,entity_id',
      }),
    )
  }

  async detach(link: TagLink): Promise<void> {
    await this.handleVoid(
      this.supabase
        .from(TABLES.ENTITY_TAGS)
        .delete()
        .eq('tag_id', link.tag_id)
        .eq('entity_type', link.entity_type)
        .eq('entity_id', link.entity_id),
    )
  }
}
