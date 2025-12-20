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

type UseNotesArgs = { pageSize?: number }

function getErrorMessage(err: unknown, fallback = "Something went wrong.") {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  return fallback
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

  useEffect(() => setPage(1), [search])

  const fetchNotes = async () => {
    setLoading(true)
    setError(null)

    try {
      let countQuery = supabase
        .from("notes")
        .select("id", { count: "exact", head: true })

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

      const [{ count: c, error: countErr }, { data, error: dataErr }] =
        await Promise.all([countQuery, dataQuery])

      if (countErr || dataErr) {
        throw new Error((countErr || dataErr)?.message ?? "Failed to load notes.")
      }

      setCount(c ?? 0)
      setNotes((data ?? []) as NoteListItem[])
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load notes."))
      setNotes([])
      setCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, from, to])

  const deleteNote = async (id: string) => {
    setError(null)
    setDeletingId(id)

    const prevNotes = notes
    const prevCount = count
    const prevPage = page

    const nextNotes = prevNotes.filter((n) => n.id !== id)

    setNotes(nextNotes)
    setCount(Math.max(0, prevCount - 1))

    try {
      const { error } = await supabase.from("notes").delete().eq("id", id)
      if (error) throw new Error(error.message)

      if (nextNotes.length === 0 && prevPage > 1) setPage(prevPage - 1)
    } catch (err: unknown) {
      setNotes(prevNotes)
      setCount(prevCount)
      const msg = getErrorMessage(err, "Failed to delete note.")
      setError(msg)
      throw new Error(msg)
    } finally {
      setDeletingId(null)
    }
  }

  return {
    notes,
    count,
    loading,
    error,

    search,
    setSearch,
    clearSearch,

    page,
    setPage,
    pageSize,
    totalPages,
    showingText,

    deletingId,
    deleteNote,

    refetch: fetchNotes,
  }
}