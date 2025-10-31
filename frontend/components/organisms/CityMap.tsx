import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import buildingsData from '../../data/buildings.json'
import MapView from '../molecules/MapView'
import DetailsPanel from '../molecules/DetailsPanel'
import { useAuth } from '../../context/AuthContext'

type Building = {
  name: string
  file: string
  category?: string
  size?: string
  stats?: Record<string, any>
}

interface Placement {
  id?: number
  buildingId: number
  gx: number
  gy: number
}

const mockPlacements: Placement[] = [
  { id: 1, buildingId: 1, gx: 8, gy: 4 },
  { id: 2, buildingId: 3, gx: 10, gy: 6 },
  { id: 3, buildingId: 7, gx: 12, gy: 8 },
]

// helper to normalize image path like "/assets/buildings/office.png" -> "/buildings/office.png"
function normalizeImage(file?: string) {
  if (!file) return ''
  const parts = file.split('/')
  const basename = parts[parts.length - 1]
  return basename ? `/buildings/${basename}` : file
}

export default function CityMap({ cityId = 1, scale = 1 }: { cityId?: number; scale?: number }) {
  const [placements, setPlacements] = useState<Placement[]>(mockPlacements)
  const [selected, setSelected] = useState<Placement | null>(null)

  // convert imported buildings JSON to typed array
  const buildings: Building[] = (buildingsData as unknown) as Building[]

  // placement area sizing (available to render and to placement algorithm)
  const areaScale = 0.5
  const allowedWidth = Math.floor(780 * areaScale)
  const allowedHeight = Math.floor(600 * areaScale)

  // isometric helpers: given grid coords gx,gy and cell size, compute pixel x/y
  const cellW = 18 // nominal tile width in px
  const cellH = 11 // nominal tile height in px (half of width for isometric)

  // compute gridCols/gridRows from allowed pixel area so overlay aligns with placement logic
  function computeGridSize(count: number) {
    const maxSumByWidth = Math.floor(allowedWidth / (cellW / 2))
    const maxSumByHeight = Math.floor(allowedHeight / (cellH / 2))
    const maxSum = Math.min(maxSumByWidth, maxSumByHeight)
    const gridCols = Math.max(4, Math.min(count, Math.ceil(maxSum / 2)))
    let gridRows = Math.max(3, maxSum - gridCols)
    if (gridCols * gridRows < count) {
      gridRows = Math.ceil(count / gridCols)
    }
    return { gridCols, gridRows }
  }

  // later: fetch placements from API
  const { token } = useAuth()
  useEffect(() => {
    if (!token) {
      // if no auth token, keep mock placements (or you can choose to fetch unauthenticated)
      return
    }

    fetch(`/api/cities/${cityId}/buildings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        // data is expected to be an array of cityBuilding records { id, buildingId, gx, gy, building }
        if (!Array.isArray(data)) return
        const mapped: Placement[] = data.map((d: any) => ({ id: d.id, buildingId: d.buildingId, gx: d.gx ?? 0, gy: d.gy ?? 0 }))
        setPlacements(mapped)
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch city placements', err)
      })
  }, [cityId, token])

  const getBuilding = (id: number) => buildings[id - 1]

  const rendered = useMemo(() => placements.map((p) => {
    const b = getBuilding(p.buildingId)
    // isometric transform
    const isoX = (p.gx - p.gy) * (cellW / 2)
    const isoY = (p.gx + p.gy) * (cellH / 2)
    const imgSrc = normalizeImage(b?.file)
    return { p, b, isoX, isoY, imgSrc }
  }), [placements])

  return (
    <Wrap>
      <MapView
        buildingsCount={buildings.length}
        gridCols={computeGridSize(buildings.length).gridCols}
        gridRows={computeGridSize(buildings.length).gridRows}
        areaW={allowedWidth}
        areaH={allowedHeight}
        rendered={rendered}
        onSelect={(p) => setSelected(p)}
        scale={scale}
      />

      <DetailsPanel selected={selected} getBuilding={getBuilding} onClose={() => setSelected(null)} />
    </Wrap>
  )
}

const Wrap = styled.div`
  /* Match GridMap sizing and centering so buildings align exactly */
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 868px;
  height: 420px;
`
