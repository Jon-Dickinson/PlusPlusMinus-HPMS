import express from 'express'
import { prisma } from '../db.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = express.Router()

// GET /api/cities/:id/buildings
router.get('/:id/buildings', verifyToken, async (req, res) => {
  try {
    const cityId = Number(req.params.id)
    const placements = await prisma.cityBuilding.findMany({ where: { cityId }, include: { building: true } })
    res.json(placements)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching city buildings:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
