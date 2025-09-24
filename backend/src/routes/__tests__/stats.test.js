const request = require('supertest')
const express = require('express')

jest.mock('fs', () => ({
  readFile: jest.fn(),
  statSync: jest.fn(),
}))

const fs = require('fs')
const statsRouter = require('../stats')

const app = express()
app.use('/api/stats', statsRouter)

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message })
})

const mockItems = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
  { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
  { id: 3, name: 'Ultra‑Wide Monitor', category: 'Electronics', price: 999 },
]

const mockStats = {
  mtime: new Date('2023-01-01T00:00:00.000Z'),
}

describe('Stats Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/stats', () => {
    it('should return calculated stats successfully', async () => {
      fs.readFile.mockImplementation((path, callback) => {
        callback(null, JSON.stringify(mockItems))
      })
      fs.statSync.mockReturnValue(mockStats)

      const response = await request(app).get('/api/stats').expect(200)

      expect(response.body).toEqual({
        total: 3,
        averagePrice: 1299, // (2499 + 399 + 999) / 3
      })
    })

    it('should handle file read errors', async () => {
      fs.readFile.mockImplementation((path, callback) => {
        callback(new Error('File not found'), null)
      })
      fs.statSync.mockImplementation(() => {
        throw new Error('File not found')
      })

      const response = await request(app).get('/api/stats').expect(500)

      expect(response.body.error).toBeDefined()
    })

    it('should handle invalid JSON in file', async () => {
      fs.readFile.mockImplementation((path, callback) => {
        callback(null, 'invalid json')
      })
      fs.statSync.mockImplementation(() => {
        throw new Error('File not found')
      })

      const response = await request(app).get('/api/stats').expect(500)

      expect(response.body.error).toBeDefined()
    })
  })
})
