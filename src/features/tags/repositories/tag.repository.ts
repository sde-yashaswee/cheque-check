import type { Tag, TagEntityType, TagWithUsage } from '@/types'
import { TABLES } from '@/lib/supabase/tables'
import { SupabaseRepository } from '@/repositories/base.repository'

export interface TagLink {
  tag_id: string
  entity_type: TagEntityType
  entity_id: string
}

export interface ITagRepository {
  getAll(businessId: string): Promise<Tag[]>
  getAllWithUsage(businessId: string): Promise<TagWithUsage[]>
  getById(id: string): Promise<Tag>
  getLinks(tagId: string): Promise<TagLink[]>
  getTagsByEntity(
    businessId: string | null,
    entityType: TagEntityType,
  ): Promise<Array<{ entity_id: string; tag: Tag }>>
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

  async getAllWithUsage(businessId: string): Promise<TagWithUsage[]> {
    const rows = (await this.handle(
      this.supabase
        .from(TABLES.TAGS)
        .select('*, entity_tags(entity_type)')
        .eq('business_id', businessId)
        .order('name', { ascending: true }),
    )) as unknown as Array<Tag & { entity_tags: unknown[] | null }>
    return rows.map(({ entity_tags, ...tag }) => ({
      ...tag,
      usage_count: entity_tags?.length ?? 0,
    }))
  }

  async getById(id: string): Promise<Tag> {
    return this.handle(
      this.supabase.from(TABLES.TAGS).select('*').eq('id', id).single(),
    ) as Promise<Tag>
  }

  async getLinks(tagId: string): Promise<TagLink[]> {
    return this.handle(
      this.supabase
        .from(TABLES.ENTITY_TAGS)
        .select('tag_id, entity_type, entity_id')
        .eq('tag_id', tagId),
    ) as Promise<TagLink[]>
  }

  async getTagsByEntity(
    businessId: string | null,
    entityType: TagEntityType,
  ): Promise<Array<{ entity_id: string; tag: Tag }>> {
    let query = this.supabase
      .from(TABLES.ENTITY_TAGS)
      .select('entity_id, tag:tags!inner(*)')
      .eq('entity_type', entityType)
    if (businessId) query = query.eq('tag.business_id', businessId)
    return this.handle(query) as unknown as Promise<
      Array<{ entity_id: string; tag: Tag }>
    >
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
