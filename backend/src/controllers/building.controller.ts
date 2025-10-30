import { RequestHandler } from 'express'
import * as service from '../services/building.service.js'

export const listBuildingTypes: RequestHandler = async (req, res) => {
  const list = await service.listBuildingTypes()
  // adapt shape for frontend: provide footprint object and stats
  const payload = list.map((b: any) => ({
    id: b.id,
    name: b.name,
    file: b.file,
    category: b.category?.name,
    footprint: { width: b.sizeX, height: b.sizeY },
    minRoleLevel: b.minRoleLevel,
    stats: {
      employs: b.employs,
      houses: b.houses,
      services: b.services,
      feeds: b.feeds,
      waterUsage: b.waterUsage,
      powerUsage: b.powerUsage,
      powerOutput: b.powerOutput,
    },
  }))
  res.json({ buildings: payload })
}

export const getBuilding: RequestHandler = async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  const b = await service.getBuildingById(id)
  if (!b) return res.status(404).json({ error: 'Not found' })
  const payload = {
    id: b.id,
    name: b.name,
    file: b.file,
    category: b.category?.name,
    footprint: { width: b.sizeX, height: b.sizeY },
    minRoleLevel: b.minRoleLevel,
    stats: {
      employs: b.employs,
      houses: b.houses,
      services: b.services,
      feeds: b.feeds,
      waterUsage: b.waterUsage,
      powerUsage: b.powerUsage,
      powerOutput: b.powerOutput,
    },
  }
  res.json({ building: payload })
}

export const createBuilding: RequestHandler = async (req, res) => {
  const data = req.body
  if (!data || !data.name) return res.status(400).json({ error: 'Missing building name' })
  const rec = await service.createBuilding(data)
  res.status(201).json({ building: rec })
}

export const updateBuilding: RequestHandler = async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  const rec = await service.updateBuilding(id, req.body)
  res.json({ building: rec })
}

export const removeBuilding: RequestHandler = async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  const rec = await service.deleteBuilding(id)
  res.json({ building: rec })
}

export const listCityBuildings: RequestHandler = async (req, res) => {
  const cityId = Number(req.params.cityId)
  if (Number.isNaN(cityId)) return res.status(400).json({ error: 'Invalid cityId' })
  const list = await service.listCityBuildings(cityId)
  res.json({ cityBuildings: list })
}

export const createCityBuilding: RequestHandler = async (req, res) => {
  const cityId = Number(req.params.cityId)
  const { buildingId, gx, gy, quantity } = req.body
  if (Number.isNaN(cityId) || !buildingId) return res.status(400).json({ error: 'Missing parameters' })
  const rec = await service.placeBuildingOnCity(cityId, Number(buildingId), gx ?? null, gy ?? null, quantity ?? 1)
  res.status(201).json({ cityBuilding: rec })
}

export const patchCityBuilding: RequestHandler = async (req, res) => {
  const id = Number(req.params.id)
  const payload = req.body
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  const rec = await service.updateCityBuilding(id, payload)
  res.json({ cityBuilding: rec })
}

export const deleteCityBuilding: RequestHandler = async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  const rec = await service.removeCityBuilding(id)
  res.json({ cityBuilding: rec })
}

export default {
  listBuildingTypes,
  getBuilding,
  listCityBuildings,
  createCityBuilding,
  patchCityBuilding,
  deleteCityBuilding,
  createBuilding,
  updateBuilding,
  removeBuilding,
}
