import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/router';
import { Root, Info, Heading, Icon, Left } from './styles';
import Authorized from '../../atoms/Authorized';
import { SaveButton } from '../../atoms/--shared-styles';
import { useCity } from '../../organisms/CityContext';
import axios from '../../../lib/axios';
import Toast from '../../atoms/Toast';
import { 
  RoleBadgeContainer, 
  RoleBadge, 
  StatusIndicator, 
  StatusDot, 
  getStatusDotCount 
} from '../--shared-styles';
import { Row, Column } from '../../atoms/Blocks';

const Header = React.memo(function Header() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  
  // Prevent rendering during router transitions
  if (!router.isReady) {
    return null;
  }
  
  // Header may be used on pages that don't include a CityProvider (e.g., user-list),
  // so call useCity safely and treat absence of provider as null.
  let cityContext: any = null;
  try {
    cityContext = useCity();
  } catch (err) {
    cityContext = null;
  }
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showToast, setShowToast] = useState(false);

  const titleForPath = useCallback((path: string) => {
    if (path.startsWith('/user-list')) return 'User List';
    if (path.startsWith('/building-analysis')) return 'Building Analysis';
    // default to dashboard
    return 'City Builder';
  }, []);

  const handleSave = useCallback(async () => {
    if (!user || !user.city) return;
    try {
      // gather state
      const { grid, buildingLog, getTotals } = cityContext as any;
      const totals = getTotals ? getTotals() : { qualityIndex: 0 };
      const payload = {
        gridState: grid,
        buildingLog: buildingLog,
        note: (user.notes && user.notes[0] && user.notes[0].content) || '',
        qualityIndex: totals.qualityIndex,
      };

      const response = await axios.instance.put(`/cities/${user.city.id}/data`, payload);
      setMessage({ type: 'success', text: 'City data saved successfully!' });
      setShowToast(true);

      // update stored user and initialize grid in-place if the server returned the saved city
      try {
        const updatedCity = response.data;
        if (updatedCity && setUser) {
          const newUser = { ...user, city: updatedCity } as any;
          setUser(newUser);

          // attempt to re-init grid
          try {
            const gridStateRaw = updatedCity.gridState;
            let gridArray: any[] = [];
            if (gridStateRaw) {
              if (typeof gridStateRaw === 'string') {
                try { gridArray = JSON.parse(gridStateRaw); } catch (e) { gridArray = []; }
              } else if (Array.isArray(gridStateRaw)) {
                gridArray = gridStateRaw;
              }
            }
            const buildingLog = updatedCity.buildingLog && Array.isArray(updatedCity.buildingLog) ? updatedCity.buildingLog : [];
            if (gridArray && gridArray.length && cityContext && cityContext.initializeGrid) {
              cityContext.initializeGrid(gridArray, buildingLog);
            }
          } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save city data.' });
      setShowToast(true);
    }
  }, [user, cityContext, setUser]);

  const handleToastClose = useCallback(() => {
    setShowToast(false);
    setMessage(null);
  }, []);

  const heading = titleForPath(router.pathname || '');
  return (
    <Root>
      <Left>
        <Heading>{heading}</Heading>
      </Left>
        <Authorized allowed={['ADMIN', 'MAYOR']}>
          {user?.city && cityContext && (
            <SaveButton onClick={handleSave}>Save</SaveButton>
          )}
        </Authorized>
      <Info>
      <Column>
        {user ? (
          <Row justify="end" align="center">
            <Heading>
              {user.firstName || user.lastName
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : user.username || user.email || 'User'}
            </Heading>
            <RoleBadgeContainer>
              <RoleBadge role={user.role || 'USER'}>
                {(user.role || 'USER').toString().toUpperCase()}
              </RoleBadge>
              {user.role === 'MAYOR' && user.hierarchy?.level && (
                <StatusIndicator>
                  {Array.from({ length: getStatusDotCount(user.hierarchy.level) }, (_, index) => (
                    <StatusDot key={index} />
                  ))}
                </StatusIndicator>
              )}
            </RoleBadgeContainer>
            <Icon src="/user.svg" alt="User" />
          </Row>
        ) : (
          <div> </div>
        )}
      </Column>
       <Column>
      
       </Column>
       {showToast && message && (
         <Toast message={message.text} type={message.type} onClose={handleToastClose} />
       )}

      </Info>
    </Root>
  );
});

export default Header;