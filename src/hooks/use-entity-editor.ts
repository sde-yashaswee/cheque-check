import { useEffect } from 'react'
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, type QueryKey } from '@tanstack/react-query'
import type { ZodType } from 'zod'

interface UseEntityEditorOptions<TEntity, TFormValues extends FieldValues> {
  queryKey: QueryKey
  fetchFn: () => Promise<TEntity>
  schema: ZodType<TFormValues>
  defaultValues: DefaultValues<TFormValues>
  /** Maps the fetched entity onto form field values, used to reset the form once it loads. */
  toFormValues: (entity: TEntity) => TFormValues
}

/** Shared skeleton for edit-entity hooks: fetch-by-id + a form that resets once the entity loads. */
export function useEntityEditor<TEntity, TFormValues extends FieldValues>({
  queryKey,
  fetchFn,
  schema,
  defaultValues,
  toFormValues,
}: UseEntityEditorOptions<TEntity, TFormValues>) {
  const {
    data: entity,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: fetchFn,
  })

  const form = useForm<TFormValues>({
    resolver: zodResolver(schema as never) as Resolver<TFormValues>,
    defaultValues,
  })

  const { reset } = form

  useEffect(() => {
    if (entity) {
      reset(toFormValues(entity))
    }
  }, [entity, reset, toFormValues])

  return { entity, isLoading, error, form }
}
