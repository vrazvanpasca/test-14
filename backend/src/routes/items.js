const express = require('express')
const fs = require('fs').promises
const path = require('path')
const router = express.Router()
const DATA_PATH = path.join(__dirname, '../../../data/items.json')

// Read data asynchronously
async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    throw new Error(`Failed to read data: ${error.message}`)
  }
}

// Write data asynchronously
async function writeData(data) {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    throw new Error(`Failed to write data: ${error.message}`)
  }
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData()
    const { limit, offset, q } = req.query
    let results = data

    if (q) {
      // Simple substring search (sub‑optimal)
      results = results.filter((item) => item.name.toLowerCase().includes(q.toLowerCase()))
    }

    // Apply pagination
    const offsetNum = parseInt(offset) || 0
    const limitNum = parseInt(limit) || results.length
    
    if (offsetNum > 0) {
      results = results.slice(offsetNum)
    }
    
    if (limitNum > 0) {
      results = results.slice(0, limitNum)
    }

    res.json(results)
  } catch (err) {
    next(err)
  }
})

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData()
    const item = data.find((i) => i.id === parseInt(req.params.id))
    if (!item) {
      const err = new Error('Item not found')
      err.status = 404
      throw err
    }
    res.json(item)
  } catch (err) {
    next(err)
  }
})

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body
    const data = await readData()
    item.id = Date.now()
    data.push(item)
    await writeData(data)
    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
})

module.exports = router
