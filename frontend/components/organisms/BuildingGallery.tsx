import React from 'react';
import styled from 'styled-components';
import buildingsData from '../../data/buildings.json';

type Building = {
  name: string;
  file: string;
  category?: string;
  size?: string;
  stats?: Record<string, any>;
};

type Props = {
  filterCategory?: string;
  cols?: number;
  onSelect?: (b: Building) => void;
};

export default function BuildingGallery({ filterCategory, cols = 4, onSelect }: Props) {
  // buildingsData comes from frontend/data/buildings.json
  const buildings: Building[] = buildingsData as unknown as Building[];

  const list = filterCategory ? buildings.filter((b) => b.category === filterCategory) : buildings;

  return (
    <Wrap>
      <Grid cols={cols}>
        {list.map((b, i) => {
          // normalize the image path to public/buildings/<basename>
          const parts = b.file ? b.file.split('/') : [];
          const basename = parts.length ? parts[parts.length - 1] : '';
          const src = basename ? `/buildings/${basename}` : b.file;

          return (
            <Card key={i} onClick={() => onSelect?.(b)} role="button" aria-label={b.name}>
              <Thumb src={src} alt={b.name} />
              <Meta>
                <Name>{b.name}</Name>
                <Small>{b.size}</Small>
              </Meta>
            </Card>
          );
        })}
      </Grid>
    </Wrap>
  );
}

const Wrap = styled.div`
  width: 100%;
`;

const Grid = styled.div<{ cols: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.cols}, 1fr);
  gap: 12px;
  align-items: start;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(2, 6, 23, 0.12);
  }
`;

const Thumb = styled.img`
  width: 100%;
  height: 140px;
  object-fit: contain;
  background: #fff;
  border-radius: 6px;
`;

const Meta = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #0b1220;
`;

const Small = styled.div`
  font-size: 12px;
  color: #4b5563;
`;
