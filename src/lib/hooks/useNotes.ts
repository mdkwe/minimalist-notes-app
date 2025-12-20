import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export type NoteListItem = {
  id: string
  title: string
  subtitle: string
  content: string
  created_at: string
  updated_at: string
}

type UseNotesArgs = {
  pageSize?: number
}

export function useNotes({ pageSize = 6 }: UseNotesArgs = {}) {
  const [notes, setNotes] = useState<NoteListItem[]>([])
  const [count, setCount] = useState(0)

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const showingText = useMemo(() => {
    if (count === 0) return "Showing 0 of 0 notes"
    const start = from + 1
    const end = Math.min(from + notes.length, count)
    return `Showing ${start}–${end} of ${count} notes`
  }, [count, from, notes.length])

  const clearSearch = () => setSearch("")

  // Reset to page 1 when search changes
  useEffect(() => setPage(1), [search])

  const fetchNotes = async () => {
    setLoading(true)
    setError(null)

    let countQuery = supabase.from("notes").select("id", { count: "exact", head: true })
    let dataQuery = supabase
      .from("notes")
      .select("id,title,subtitle,content,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .range(from, to)

    const q = search.trim()
    if (q) {
      const filter = `%${q}%`
      const or = `title.ilike.${filter},subtitle.ilike.${filter},content.ilike.${filter}`
      countQuery = countQuery.or(or)
      dataQuery = dataQuery.or(or)
    }

    const [{ count: c, error: countErr }, { data, error: dataErr }] = await Promise.all([
      countQuery,
      dataQuery,
    ])

    if (countErr || dataErr) {
      setError((countErr || dataErr)?.message ?? "Failed to load notes.")
      setNotes([])
      setCount(0)
    } else {
      setCount(c ?? 0)
      setNotes((data ?? []) as NoteListItem[])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])

  const deleteNote = async (id: string) => {
    setError(null)
    setDeletingId(id)

    // optimistic remove
    const prevNotes = notes
    const prevCount = count

    const nextNotes = prevNotes.filter((n) => n.id !== id)
    setNotes(nextNotes)
    setCount(Math.max(0, prevCount - 1))

    const { error } = await supabase.from("notes").delete().eq("id", id)

    setDeletingId(null)

    if (error) {
      // rollback
      setNotes(prevNotes)
      setCount(prevCount)
      setError(error.message)
      return
    }

    // if the page became empty, go back one page
    if (nextNotes.length === 0 && page > 1) setPage((p) => p - 1)
  }

  return {
    // data
    notes,
    count,

    // ui states
    loading,
    error,

    // controls
    search,
    setSearch,
    clearSearch,

    page,
    setPage,
    pageSize,
    totalPages,
    showingText,

    // delete
    deletingId,
    deleteNote,

    // misc
    refetch: fetchNotes,
  }
}