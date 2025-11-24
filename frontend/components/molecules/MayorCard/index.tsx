import React, { useEffect, useState, Suspense } from 'react';
import { MapPin, User, Trash2, Shield } from 'lucide-react';
import { fetchMayor, Mayor } from './api';
import { Card, Left, Meta, Muted, Center, QualityIndex, DeleteButton, Properties } from './styles';
import PermissionsModal from '../PermissionsModal';

interface MayorData {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  mayorId?: number;
  hierarchyId?: number;
  hierarchy?: {
    id: number;
    name: string;
    level: number;
  };
  city?: {
    name: string;
    country: string;
    qualityIndex?: number;
  };
}

export interface MayorCardProps {
  id: number | string;
  mayorData?: MayorData;
  onClick?: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
}

export default function MayorCard({ id, mayorData, onClick, onDelete }: MayorCardProps) {
  const [mayor, setMayor] = useState<Mayor | null>(null);

  useEffect(() => {
    // If mayorData is provided, use it directly and skip API call
    if (mayorData) {
      setMayor({
        id: mayorData.id,
        firstName: mayorData.firstName,
        lastName: mayorData.lastName,
        city: mayorData.city
      });
      return;
    }

    // Fallback to API call if no mayorData provided
    let mounted = true;
    fetchMayor(id)
      .then((mayorDataFromApi) => {
        if (!mounted) return;
        setMayor(mayorDataFromApi);
      })
      .catch(() => {
        if (!mounted) return;
        setMayor(null);
      });

    return () => {
      mounted = false;
    };
  }, [id, mayorData]);

  const handleClick = () => onClick && onClick(id);

  const cityName = mayor?.city?.name || '—';
  const country = mayor?.city?.country || '—';
  const qualityIndex = mayor?.city?.qualityIndex;
  const firstName = mayor?.firstName || '—';
  const lastName = mayor?.lastName || '—';

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDelete) onDelete(id);
  };

  const [showPermissions, setShowPermissions] = useState(false);

  const openPermissions = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowPermissions(true);
  };

  const closePermissions = () => setShowPermissions(false);

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
        <Muted>{qualityIndex !== undefined ? `${Math.round(qualityIndex)}%` : '—'}</Muted>
      </QualityIndex>

      <Properties>
        <DeleteButton onClick={openPermissions} title="Permissions">
          <Shield size={16} />
        </DeleteButton>
        <DeleteButton onClick={handleDelete} title="Delete">
          <Trash2 size={16} />
        </DeleteButton>
      </Properties>

      {/* Load the permissions modal when requested */}
      {showPermissions && (
        // lazy-loaded inline import to avoid bundling issues
        <Suspense fallback={<div />}> 
          <PermissionsModal isOpen={true} userId={Number(id)} onClose={closePermissions} />
        </Suspense>
      )}
    </Card>
  );
}
