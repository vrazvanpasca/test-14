import React, { createContext, useCallback, useContext, useState } from 'react'

const DataContext = createContext()

export function DataProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  })

  const fetchItems = useCallback(async (signal, options = {}) => {
    const { page = 1, limit = 20, search = '' } = options

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      })

      if (search) {
        params.append('q', search)
      }

      const res = await fetch(`http://localhost:3001/api/items?${params}`, { signal })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const json = await res.json()

      setItems(json)
      setPagination((prev) => ({
        ...prev,
        page,
        limit,
        total: json.length,
        hasMore: json.length === limit,
      }))
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
        console.error('Failed to fetch items:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const searchItems = useCallback(
    async (signal, searchTerm) => {
      await fetchItems(signal, { page: 1, search: searchTerm })
    },
    [fetchItems]
  )

  const loadMore = useCallback(
    async (signal) => {
      if (!pagination.hasMore || loading) return

      const nextPage = pagination.page + 1
      await fetchItems(signal, {
        page: nextPage,
        limit: pagination.limit,
        search: '', // Keep current search if needed
      })
    },
    [fetchItems, pagination, loading]
  )

  return (
    <DataContext.Provider
      value={{
        items,
        loading,
        error,
        pagination,
        fetchItems,
        searchItems,
        loadMore,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
