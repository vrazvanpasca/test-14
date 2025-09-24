const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()
const DATA_PATH = path.join(__dirname, '../../../data/items.json')

let statsCache = null
let lastModified = null

function calculateStats(items) {
  return {
    total: items.length,
    averagePrice: items.length > 0 ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length : 0,
  }
}

function isCacheValid() {
  try {
    const stats = fs.statSync(DATA_PATH)
    return statsCache && lastModified && stats.mtime.getTime() === lastModified.getTime()
  } catch (error) {
    return false
  }
}

function updateCache() {
  return new Promise((resolve, reject) => {
    fs.readFile(DATA_PATH, (err, raw) => {
      if (err) return reject(err)

      try {
        const items = JSON.parse(raw)
        statsCache = calculateStats(items)

        const stats = fs.statSync(DATA_PATH)
        lastModified = stats.mtime

        resolve(statsCache)
      } catch (parseError) {
        reject(parseError)
      }
    })
  })
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    // Check if cache is valid
    if (isCacheValid()) {
      return res.json(statsCache)
    }

    // Update cache and return stats
    const stats = await updateCache()
    res.json(stats)
  } catch (err) {
    next(err)
  }
})

module.exports = router
