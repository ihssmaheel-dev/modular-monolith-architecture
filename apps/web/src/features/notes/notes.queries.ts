import { queryOptions } from '@tanstack/react-query'
import { getApiClient } from '@/lib/api'
import { useTenantStore } from '@/stores/tenant.store'

export function notesListQuery(page = 1, limit = 20) {
  const tenantId = useTenantStore.getState().tenantId
  return queryOptions({
    queryKey: ['notes', tenantId, 'list', { page, limit }] as const,
    queryFn: async () => {
      const client = getApiClient()
      const res = await client.notes.list({ page, limit } as unknown as never)
      if (res.status !== 200) throw new Error('api.note.fetchFailed')
      return res.body
    },
  })
}

export function noteByIdQuery(id: string) {
  const tenantId = useTenantStore.getState().tenantId
  return queryOptions({
    queryKey: ['notes', tenantId, 'detail', id] as const,
    queryFn: async () => {
      const client = getApiClient()
      const res = await client.notes.getById(id)
      if (res.status !== 200) throw new Error('api.note.notFound')
      return res.body
    },
    enabled: !!id,
  })
}
