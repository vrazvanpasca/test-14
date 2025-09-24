import React, { useCallback, useMemo } from 'react'
import { List } from 'react-window'
import { Link } from 'react-router-dom'
import './VirtualizedItemsList.css'

// Individual item component for virtualization
const ItemRow = React.memo(({ index, style, data }) => {
  const { items } = data
  const item = items[index]

  if (!item) {
    return (
      <div style={style} className='item-row loading-row'>
        <div className='skeleton-item'>
          <div className='skeleton-line'></div>
          <div className='skeleton-line'></div>
          <div className='skeleton-line'></div>
        </div>
      </div>
    )
  }

  return (
    <div style={style} className='item-row'>
      <div className='item-card'>
        <Link to={`/items/${item.id}`} className='item-link'>
          <div className='item-content'>
            <h3 className='item-name'>{item.name}</h3>
            <p className='item-category'>{item.category}</p>
            <p className='item-price'>${item.price}</p>
          </div>
        </Link>
      </div>
    </div>
  )
})

ItemRow.displayName = 'ItemRow'

const VirtualizedItemsList = ({ items, loading, hasMore, onLoadMore, height = 600 }) => {
  // Calculate total item count including loading placeholders
  const totalItemCount = useMemo(() => {
    return items.length + (hasMore ? 1 : 0)
  }, [items.length, hasMore])

  // Prepare data for the virtualized list
  const itemData = useMemo(
    () => ({
      items,
      hasMore,
      onLoadMore,
    }),
    [items, hasMore, onLoadMore]
  )

  // Handle scroll to bottom for infinite loading
  const handleItemsRendered = useCallback(
    ({ visibleStopIndex }) => {
      if (hasMore && visibleStopIndex >= items.length - 1) {
        onLoadMore()
      }
    },
    [hasMore, items.length, onLoadMore]
  )

  if (loading && items.length === 0) {
    return (
      <div className='virtualized-loading-container'>
        <div className='skeleton-list'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='skeleton-item'>
              <div className='skeleton-line'></div>
              <div className='skeleton-line'></div>
              <div className='skeleton-line'></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className='empty-state'>
        <p>No items found</p>
      </div>
    )
  }

  return (
    <div className='virtualized-container'>
      <List
        height={height}
        itemCount={totalItemCount}
        itemSize={120} // Height of each item
        itemData={itemData}
        onItemsRendered={handleItemsRendered}
        overscanCount={5} // Render 5 extra items for smooth scrolling
        className='virtualized-list'
      />

      {loading && items.length > 0 && (
        <div className='loading-indicator'>
          <div className='spinner'></div>
          <span>Loading more items...</span>
        </div>
      )}
    </div>
  )
}

export default VirtualizedItemsList
