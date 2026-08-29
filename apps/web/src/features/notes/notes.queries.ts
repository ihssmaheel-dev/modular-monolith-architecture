import { queryOptions } from '@tanstack/react-query'
import { getApiClient } from '@/lib/api'

export function notesListQuery(page = 1, limit = 20) {
  return queryOptions({
    queryKey: ['notes', 'list', { page, limit }] as const,
    queryFn: async () => {
      const client = getApiClient()
      const res = await client.notes.list({ page, limit } as unknown as never)
      if (res.status !== 200) throw new Error('Failed to fetch notes')
      return res.body
    },
  })
}

export function noteByIdQuery(id: string) {
  return queryOptions({
    queryKey: ['notes', 'detail', id] as const,
    queryFn: async () => {
      const client = getApiClient()
      const res = await client.notes.getById(id)
      if (res.status !== 200) throw new Error('Note not found')
      return res.body
    },
    enabled: !!id,
  })
}
