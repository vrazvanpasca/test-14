import React, { useEffect, useState, useCallback } from 'react'
import { useData } from '../state/DataContext'
import { Link } from 'react-router-dom'
import VirtualizedItemsList from '../components/VirtualizedItemsList'
import './Items.css'

function Items() {
  const { items, loading, error, pagination, fetchItems, searchItems, loadMore } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Initial load
  useEffect(() => {
    const abortController = new AbortController()
    fetchItems(abortController.signal).catch((error) => {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch items:', error)
      }
    })
    return () => abortController.abort()
  }, [fetchItems])

  // Debounced search
  const handleSearch = useCallback(
    (value) => {
      setSearchTerm(value)

      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      const timeout = setTimeout(() => {
        const abortController = new AbortController()
        searchItems(abortController.signal, value).catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Failed to search items:', error)
          }
        })
        return () => abortController.abort()
      }, 300)

      setSearchTimeout(timeout)
    },
    [searchItems, searchTimeout]
  )

  const handleLoadMore = useCallback(() => {
    const abortController = new AbortController()
    loadMore(abortController.signal).catch((error) => {
      if (error.name !== 'AbortError') {
        console.error('Failed to load more items:', error)
      }
    })
    return () => abortController.abort()
  }, [loadMore])

  if (error) {
    return (
      <div className='error-container'>
        <h2>Error loading items</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  return (
    <div className='items-container'>
      <div className='items-header'>
        <h1>Items</h1>
        <div className='search-container'>
          <input
            type='text'
            placeholder='Search items...'
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className='search-input'
            aria-label='Search items'
          />
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className='loading-container'>
          <div className='skeleton-list'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='skeleton-item'>
                <div className='skeleton-line'></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Use virtualized list for large datasets, regular grid for smaller ones */}
          {items.length > 50 ? (
            <VirtualizedItemsList
              items={items}
              loading={loading}
              hasMore={pagination.hasMore}
              onLoadMore={handleLoadMore}
              height={600}
            />
          ) : (
            <>
              <div className='items-list' role='list'>
                {items.map((item) => (
                  <div key={item.id} className='item-card' role='listitem'>
                    <Link to={`/items/${item.id}`} className='item-link'>
                      <div className='item-content'>
                        <h3 className='item-name'>{item.name}</h3>
                        <p className='item-category'>{item.category}</p>
                        <p className='item-price'>${item.price}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {pagination.hasMore && (
                <div className='load-more-container'>
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className='load-more-btn'
                    aria-label='Load more items'
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}

              {loading && items.length > 0 && (
                <div className='loading-indicator'>
                  <div className='spinner'></div>
                  <span>Loading more items...</span>
                </div>
              )}
            </>
          )}

          {items.length === 0 && !loading && (
            <div className='empty-state'>
              <p>No items found{searchTerm && ` for "${searchTerm}"`}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Items
