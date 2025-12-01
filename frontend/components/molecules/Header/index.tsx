import React, { useState, useCallback, useEffect } from 'react';
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
  getStatusDotCount,
} from '../--shared-styles';
import { Row, Column } from '../../atoms/Blocks';


// ------------------------------
// Helpers
// ------------------------------

function getHeadingTitle(path: string): string {
  if (path.startsWith('/user-list')) return 'User List';
  if (path.startsWith('/building-analysis')) return 'Building Analysis';
  return 'City Builder';
}

// Header may render without CityProvider → return null safely
function getSafeCityContext() {
  try {
    return useCity();
  } catch {
    return null;
  }
}

// Build payload depending on whether CityContext exists
function buildSavePayload(user: any, cityContext: any) {
  if (!user?.city) return null;

  const note = user?.notes?.[0]?.content || '';

  if (cityContext) {
    const { grid, buildingLog, getTotals } = cityContext;
    const totals = getTotals ? getTotals() : { qualityIndex: 0 };

    return {
      gridState: grid,
      buildingLog,
      note,
      qualityIndex: totals.qualityIndex,
    };
  }

  // fallback (context missing)
  return {
    gridState: user.city.gridState || [],
    buildingLog: user.city.buildingLog || [],
    note,
    qualityIndex: 0,
  };
}

// Initialize grid with returned data from the server
function applyReturnedCityState(updatedCity: any, cityContext: any, setUser: any, user: any) {
  if (!updatedCity || !setUser) return;

  // Update user
  const newUser = { ...user, city: updatedCity };
  setUser(newUser);

  // Re-init grid if context available
  if (!cityContext?.initializeGrid) return;

  let gridArray: any[] = [];

  if (typeof updatedCity.gridState === 'string') {
    try {
      gridArray = JSON.parse(updatedCity.gridState);
    } catch {
      gridArray = [];
    }
  } else if (Array.isArray(updatedCity.gridState)) {
    gridArray = updatedCity.gridState;
  }

  const buildingLog = Array.isArray(updatedCity.buildingLog) ? updatedCity.buildingLog : [];

  if (gridArray.length > 0) {
    cityContext.initializeGrid(gridArray, buildingLog);
  }
}


// ------------------------------
// Component
// ------------------------------

const Header = React.memo(function Header() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const cityContext = getSafeCityContext();

  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSave = useCallback(async () => {
    if (!user?.city) return;

    const payload = buildSavePayload(user, cityContext);
    if (!payload) return;

    try {
      const response = await axios.instance.put(`/cities/${user.city.id}/data`, payload);

      setMessage({ type: 'success', text: 'City data saved successfully!' });
      setShowToast(true);

      applyReturnedCityState(response.data, cityContext, setUser, user);

    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save city data.' });
      setShowToast(true);
    }
  }, [user, cityContext, setUser]);

  const handleToastClose = useCallback(() => {
    setShowToast(false);
    setMessage(null);
  }, []);

  const heading = mounted ? getHeadingTitle(router.pathname || '') : '';

  const displayName =
    (user?.firstName || user?.lastName)
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
      : user?.username || user?.email || 'User';


  // ------------------------------
  // Render
  // ------------------------------

  return (
    <Root>
      <Left>
        <Heading>{heading}</Heading>
      </Left>

      <Authorized allowed={['MAYOR']}>
        {mounted && user?.city && (
          <SaveButton onClick={handleSave}>Save</SaveButton>
        )}
      </Authorized>

      <Info>
        <Column>
          {user ? (
            <Row justify="end" align="center">
              <Heading>{displayName}</Heading>

              <RoleBadgeContainer>
                <RoleBadge role={user.role || 'USER'}>
                  {(user.role || 'USER').toString().toUpperCase()}
                </RoleBadge>

                {user.role === 'MAYOR' && user.hierarchy?.level && (
                  <StatusIndicator>
                    {Array.from(
                      { length: getStatusDotCount(user.hierarchy.level) },
                      (_, idx) => <StatusDot key={idx} />
                    )}
                  </StatusIndicator>
                )}
              </RoleBadgeContainer>

              <Icon src="/user.svg" alt="User" />
            </Row>
          ) : (
            <div />
          )}
        </Column>

        <Column />

        {showToast && message && (
          <Toast
            message={message.text}
            type={message.type}
            onClose={handleToastClose}
          />
        )}
      </Info>
    </Root>
  );
});

export default Header;
