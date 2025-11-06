import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MapPin, User, Trash2 } from 'lucide-react';
import axios from '../../lib/axios';

type Props = {
  id: number | string;
  onClick?: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
};

const Card = styled.button`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #192748;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 3px;
  cursor: pointer;
  width: 100%;
  text-align: left;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.35);
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Muted = styled.div`
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Center = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const Properties = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  justify-content: flex-end;
`;

export default function MayorCard({ id, onClick, onDelete }: Props) {
  const [mayor, setMayor] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    axios.instance
      .get(`/users/${id}`)
      .then((res) => {
        if (!mounted) return;
        setMayor(res.data);
      })
      .catch(() => {
        if (!mounted) return;
        setMayor(null);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleClick = () => onClick && onClick(id);

  const cityName = mayor?.city?.name || '—';
  const country = mayor?.city?.country || '—';
  const firstName = mayor?.firstName || '—';
  const lastName = mayor?.lastName || '—';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  return (
    <Card onClick={handleClick} aria-label={`Mayor ${firstName} ${lastName}`}>
      <Left>
        <MapPin size={16} />
        <Meta>
          <Muted>{cityName}, {country}</Muted>
        </Meta>
      </Left>

      <Center>
        <User size={16} />
        <Muted>{firstName} {lastName}</Muted>
      </Center>

      <Properties>
        <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
          <Trash2 size={16} />
        </button>
      </Properties>
    </Card>
  );
}
