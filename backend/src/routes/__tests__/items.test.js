const request = require('supertest')
const express = require('express')
const fs = require('fs').promises
const path = require('path')
const itemsRouter = require('../items')

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}))

const app = express()
app.use(express.json())
app.use('/api/items', itemsRouter)

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message })
})

const mockItems = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
  { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
  { id: 3, name: 'Ultra‑Wide Monitor', category: 'Electronics', price: 999 },
]

describe('Items Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/items', () => {
    it('should return all items successfully', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems))

      const response = await request(app).get('/api/items').expect(200)

      expect(response.body).toEqual(mockItems)
      expect(fs.readFile).toHaveBeenCalledTimes(1)
    })

    it('should filter items by query parameter', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems))

      const response = await request(app).get('/api/items?q=laptop').expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].name).toBe('Laptop Pro')
    })

    it('should limit results when limit parameter is provided', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems))

      const response = await request(app).get('/api/items?limit=2').expect(200)

      expect(response.body).toHaveLength(2)
    })

    it('should combine query and limit parameters', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems))

      const response = await request(app).get('/api/items?q=laptop&limit=1').expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].name).toBe('Laptop Pro')
    })

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'))

      const response = await request(app).get('/api/items').expect(500)

      expect(response.body.error).toBeDefined()
    })

    it('should handle invalid JSON in file', async () => {
      fs.readFile.mockResolvedValue('invalid json')

      const response = await request(app).get('/api/items').expect(500)

      expect(response.body.error).toBeDefined()
    })
  })

  describe('GET /api/items/:id', () => {
    it('should return specific item by id', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems))

      const response = await request(app).get('/api/items/1').expect(200)

      expect(response.body).toEqual(mockItems[0])
    })

    it('should return 404 for non-existent item', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems))

      const response = await request(app).get('/api/items/999').expect(404)

      expect(response.body.error).toBe('Item not found')
    })

    it('should handle invalid id format', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems))

      const response = await request(app).get('/api/items/invalid').expect(404)

      expect(response.body.error).toBe('Item not found')
    })

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'))

      const response = await request(app).get('/api/items/1').expect(500)

      expect(response.body.error).toBeDefined()
    })
  })

  describe('POST /api/items', () => {
    it('should create new item successfully', async () => {
      const newItem = { name: 'New Item', category: 'Test', price: 100 }
      const expectedItem = { ...newItem, id: expect.any(Number) }

      fs.readFile.mockResolvedValue(JSON.stringify(mockItems))
      fs.writeFile.mockResolvedValue()

      const response = await request(app).post('/api/items').send(newItem).expect(201)

      expect(response.body).toEqual(expectedItem)
      expect(fs.writeFile).toHaveBeenCalledTimes(1)
    })

    it('should handle file read errors during creation', async () => {
      const newItem = { name: 'New Item', category: 'Test', price: 100 }

      fs.readFile.mockRejectedValue(new Error('File not found'))

      const response = await request(app).post('/api/items').send(newItem).expect(500)

      expect(response.body.error).toBeDefined()
    })

    it('should handle file write errors during creation', async () => {
      const newItem = { name: 'New Item', category: 'Test', price: 100 }

      fs.readFile.mockResolvedValue(JSON.stringify(mockItems))
      fs.writeFile.mockRejectedValue(new Error('Write failed'))

      const response = await request(app).post('/api/items').send(newItem).expect(500)

      expect(response.body.error).toBeDefined()
    })

    it('should handle invalid JSON in existing file', async () => {
      const newItem = { name: 'New Item', category: 'Test', price: 100 }

      fs.readFile.mockResolvedValue('invalid json')

      const response = await request(app).post('/api/items').send(newItem).expect(500)

      expect(response.body.error).toBeDefined()
    })

    it('should handle empty request body', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems))
      fs.writeFile.mockResolvedValue()

      const response = await request(app).post('/api/items').send({}).expect(201)

      expect(response.body.id).toBeDefined()
    })
  })
})
