import type { Tag, TagEntityType } from '@/types'
import {
  SupabaseTagRepository,
  type ITagRepository,
  type TagLink,
} from '@/features/tags/repositories/tag.repository'

let defaultTagService: TagService | undefined

function getDefaultTagService(): TagService {
  defaultTagService ??= new TagService()
  return defaultTagService
}

export class TagService {
  constructor(
    private readonly repository: ITagRepository = new SupabaseTagRepository(),
  ) {}

  static getAll(businessId: string) {
    return getDefaultTagService().getAll(businessId)
  }

  static create(input: Pick<Tag, 'business_id' | 'name' | 'color'>) {
    return getDefaultTagService().create(input)
  }

  static update(id: string, input: Partial<Pick<Tag, 'name' | 'color'>>) {
    return getDefaultTagService().update(id, input)
  }

  static delete(id: string) {
    return getDefaultTagService().delete(id)
  }

  static getForEntity(entityType: TagEntityType, entityId: string) {
    return getDefaultTagService().getForEntity(entityType, entityId)
  }

  static attach(link: TagLink) {
    return getDefaultTagService().attach(link)
  }

  static detach(link: TagLink) {
    return getDefaultTagService().detach(link)
  }

  getAll(businessId: string) {
    return this.repository.getAll(businessId)
  }

  getAllWithUsage(businessId: string) {
    return this.repository.getAllWithUsage(businessId)
  }

  getById(id: string) {
    return this.repository.getById(id)
  }

  getLinks(tagId: string) {
    return this.repository.getLinks(tagId)
  }

  async getTagMap(businessId: string | null, entityType: TagEntityType) {
    const rows = await this.repository.getTagsByEntity(businessId, entityType)
    const map: Record<string, Tag[]> = {}
    for (const { entity_id, tag } of rows) (map[entity_id] ??= []).push(tag)
    for (const tags of Object.values(map))
      tags.sort((a, b) => a.name.localeCompare(b.name))
    return map
  }

  /** Attaches/detaches links so the entity ends up with exactly `tagIds`. */
  async syncForEntity(
    entityType: TagEntityType,
    entityId: string,
    currentIds: readonly string[],
    tagIds: readonly string[],
  ) {
    const added = tagIds.filter((id) => !currentIds.includes(id))
    const removed = currentIds.filter((id) => !tagIds.includes(id))
    await Promise.all([
      ...added.map((tag_id) =>
        this.repository.attach({
          tag_id,
          entity_type: entityType,
          entity_id: entityId,
        }),
      ),
      ...removed.map((tag_id) =>
        this.repository.detach({
          tag_id,
          entity_type: entityType,
          entity_id: entityId,
        }),
      ),
    ])
  }

  create(input: Pick<Tag, 'business_id' | 'name' | 'color'>) {
    return this.repository.create(input)
  }

  update(id: string, input: Partial<Pick<Tag, 'name' | 'color'>>) {
    return this.repository.update(id, input)
  }

  delete(id: string) {
    return this.repository.delete(id)
  }

  getForEntity(entityType: TagEntityType, entityId: string) {
    return this.repository.getForEntity(entityType, entityId)
  }

  attach(link: TagLink) {
    return this.repository.attach(link)
  }

  detach(link: TagLink) {
    return this.repository.detach(link)
  }
}

export const tagService = new Proxy(Object.create(TagService.prototype), {
  get(_target, property, receiver) {
    const service = getDefaultTagService()
    const value = Reflect.get(service, property, receiver)
    return typeof value === 'function' ? value.bind(service) : value
  },
})
