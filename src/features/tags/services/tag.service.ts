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
