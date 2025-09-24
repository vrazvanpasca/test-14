import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Items from './Items'
import ItemDetail from './ItemDetail'
import { DataProvider } from '../state/DataContext'
import './App.css'

function App() {
  const location = useLocation()

  return (
    <DataProvider>
      <div className='app'>
        <header className='app-header'>
          <nav className='app-nav' role='navigation' aria-label='Main navigation'>
            <div className='nav-container'>
              <Link to='/' className='nav-logo'>
                <h1>Item Manager</h1>
              </Link>
              <div className='nav-links'>
                <Link
                  to='/'
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                >
                  Items
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <main className='app-main' role='main'>
          <Routes>
            <Route path='/' element={<Items />} />
            <Route path='/items/:id' element={<ItemDetail />} />
          </Routes>
        </main>

        <footer className='app-footer'>
          <p>&copy; 2024 Item Manager. Built with React & Node.js</p>
        </footer>
      </div>
    </DataProvider>
  )
}

export default App
