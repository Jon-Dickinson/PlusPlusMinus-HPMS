import React from 'react'
import styled from 'styled-components'

type GridMapProps = {
  width?: string | number
  height?: string | number
  tileSize?: number
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
}

export default function GridMap({
  width = 'clamp(300px, 80vw, 700px)',
  height = 'clamp(300px, 80vw, 700px)',
  tileSize = 175,
  className,
  style,
  ariaLabel = 'Grid map background',
}: GridMapProps) {
  return <Outer className={className} style={style} role="img" aria-label={ariaLabel} $w={width} $h={height} $tile={tileSize} />
}

const Outer = styled.div<{ $w: string | number; $h: string | number; $tile: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  width: 100%;
  height:  540px;
  background-size: contain;
  background-image: url('/grid.svg');
  background-repeat: no-repeat;
  background-position: center center;
  pointer-events: none;
  user-select: none;
`
