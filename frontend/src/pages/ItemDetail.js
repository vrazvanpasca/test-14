import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import './ItemDetail.css'

function ItemDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const abortController = new AbortController()

    setLoading(true)
    setError(null)

    fetch(`http://localhost:3001/api/items/${id}`, {
      signal: abortController.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setItem(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => abortController.abort()
  }, [id])

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    // Trigger useEffect by updating a dependency
    window.location.reload()
  }

  if (loading) {
    return (
      <div className='item-detail-container'>
        <div className='item-detail-loading'>
          <div className='skeleton-detail'>
            <div className='skeleton-line skeleton-title'></div>
            <div className='skeleton-line skeleton-category'></div>
            <div className='skeleton-line skeleton-price'></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='item-detail-container'>
        <div className='item-detail-error'>
          <h2>Error loading item</h2>
          <p>{error}</p>
          <div className='error-actions'>
            <button onClick={handleRetry} className='retry-btn'>
              Try Again
            </button>
            <Link to='/' className='back-btn'>
              Back to Items
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className='item-detail-container'>
        <div className='item-detail-not-found'>
          <h2>Item not found</h2>
          <p>The item you're looking for doesn't exist or has been removed.</p>
          <Link to='/' className='back-btn'>
            Back to Items
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='item-detail-container'>
      <div className='item-detail'>
        <nav className='breadcrumb' aria-label='Breadcrumb'>
          <Link to='/' className='breadcrumb-link'>
            Items
          </Link>
          <span className='breadcrumb-separator'>/</span>
          <span className='breadcrumb-current' aria-current='page'>
            {item.name}
          </span>
        </nav>

        <div className='item-detail-content'>
          <div className='item-detail-header'>
            <h1 className='item-detail-title'>{item.name}</h1>
            <div className='item-detail-badge'>{item.category}</div>
          </div>

          <div className='item-detail-info'>
            <div className='info-section'>
              <h3>Details</h3>
              <dl className='info-list'>
                <div className='info-item'>
                  <dt>ID</dt>
                  <dd>{item.id}</dd>
                </div>
                <div className='info-item'>
                  <dt>Category</dt>
                  <dd>{item.category}</dd>
                </div>
                <div className='info-item'>
                  <dt>Price</dt>
                  <dd className='price'>${item.price.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className='item-detail-actions'>
            <Link to='/' className='back-to-list-btn'>
              ← Back to Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetail
