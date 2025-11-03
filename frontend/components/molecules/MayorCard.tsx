import React from 'react';
import styled from 'styled-components';
import { Notebook, MapPin, User, BarChart } from 'lucide-react';

type Props = {
  id: number | string;
  firstName: string;
  lastName: string;
  cityName?: string;
  country?: string;
  qualityIndex?: number | null;
  hasNotes?: boolean;
  onClick?: (id: number | string) => void;
};

const Card = styled.button`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  padding: 12px;
  background: #192748;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  text-align: left;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.35);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .muted {
    color: rgba(255,255,255,0.8);
    font-size: 13px;
  }
`;

export default function MayorCard({
  id,
  firstName,
  lastName,
  cityName = '—',
  country = '—',
  qualityIndex = null,
  hasNotes = false,
  onClick,
}: Props) {
  const handleClick = () => onClick && onClick(id);

  return (
    <Card onClick={handleClick} aria-label={`Mayor ${firstName} ${lastName}`}>
      <div className="row">
        <MapPin size={16} />
        <div className="muted">{cityName}, {country}</div>
      </div>

      <div className="row">
        <User size={16} />
        <div style={{ fontWeight: 600 }}>{firstName} {lastName}</div>
      </div>

      <div className="row">
        <BarChart size={16} />
        <div className="muted">Quality Index: {qualityIndex !== null ? `${Number(qualityIndex).toFixed(1)}%` : '—'}</div>
      </div>

      <div className="row">
        <Notebook size={16} color={hasNotes ? '#3bb55c' : '#9aa3b2'} style={{ opacity: hasNotes ? 1 : 0.8 }} />
        <div className="muted">Notes: {hasNotes ? '1+' : '0'}</div>
      </div>
    </Card>
  );
}
