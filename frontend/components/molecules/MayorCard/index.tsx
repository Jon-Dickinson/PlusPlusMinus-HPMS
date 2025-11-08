import React, { useEffect, useState } from 'react';
import { MapPin, User, Trash2 } from 'lucide-react';
import { fetchMayor, Mayor } from './api';
import { Card, Left, Meta, Muted, Center, QualityIndex, DeleteButton, Properties } from './styles';

export interface MayorCardProps {
  id: number | string;
  onClick?: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
}

export default function MayorCard({ id, onClick, onDelete }: MayorCardProps) {
  const [mayor, setMayor] = useState<Mayor | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchMayor(id)
      .then((mayorData) => {
        if (!mounted) return;
        setMayor(mayorData);
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
  const qualityIndex = mayor?.city?.qualityIndex;
  const firstName = mayor?.firstName || '—';
  const lastName = mayor?.lastName || '—';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  return (
    <Card onClick={handleClick} aria-label={`Mayor ${firstName} ${lastName}`}>
      <Left>
        
        <Meta>
          <Muted>{cityName}, {country}</Muted>
        </Meta>
      </Left>

      <Center>
         
        <Muted>{firstName} {lastName}</Muted>
      </Center>

      <QualityIndex>
        <Muted>{qualityIndex !== undefined ? qualityIndex : '—'}</Muted>
      </QualityIndex>

      <Properties>
        <DeleteButton onClick={handleDelete}>
          <Trash2 size={16} />
        </DeleteButton>
      </Properties>
    </Card>
  );
}
