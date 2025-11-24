import React, { useEffect, useState } from 'react';
import MainTemplate from '../components/templates/MainTemplate';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { CityProvider } from '../components/organisms/CityContext';
import Header from '../components/molecules/Header';
import GlobalNav from '../components/molecules/GlobalNav';
import UserGrid from '../components/molecules/UserGrid';
import DeleteConfirmationModal from '../components/molecules/DeleteConfirmationModal';
import HierarchyTreeView from '../components/organisms/HierarchyTreeView';
import axios from '../lib/axios';
import useAuthorized from '../hooks/useAuthorized';
import { useAuth } from '../context/AuthContext';
import { HierarchyAPI, useHierarchy } from '../lib/hierarchyAPI';
import { HierarchyLevel } from '../types/hierarchy';

interface User {
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
}

const ColWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const ContentWrapper = styled.div`
  padding: 1rem;
  height: calc(100vh - 120px);
  overflow: hidden;
`;

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.active ? '#004AEE' : 'transparent'};
  color: ${props => props.active ? 'white' : '#ffffff'};
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#004AEE' : 'rgba(255, 255, 255, 0.1)'};
  }
`;


export default function UserList() {
  const router = useRouter();
  const { user } = useAuth();

  const canNavigateAdmin = useAuthorized(['ADMIN']);
  // Mayors should be able to view their own subordinates on the user list
  const canViewUserList = canNavigateAdmin || user?.role === 'MAYOR';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
    role: string;
  } | null>(null);

  // Hierarchy-related state
  const [activeTab, setActiveTab] = useState<'users' | 'hierarchy'>('users');

  // Use the hierarchy hook
  const { hierarchyTree, loading: hierarchyLoading, error: hierarchyError } = useHierarchy();

  const fetchUsers = async () => {
    try {
      const res = await axios.instance.get('/users');
      setUsers(res.data || []);
    } catch (e) {
      console.error('Failed to load users', e);
      setUsers([]);
    }
  };



  const { initialized } = useAuth();

  useEffect(() => {
    let mounted = true;

    // Wait until auth is initialized (token set) before attempting protected fetches.
    if (!initialized) return () => {
      mounted = false;
    };

    (async () => {
      if (!canViewUserList) {
        // Not authorized to view the users list — avoid making the API call.
        if (mounted) {
          setUsers([]);
          setLoading(false);
        }
        return;
      }

      // Admins fetch all users. Mayors fetch their subordinates only.
      if (user?.role === 'MAYOR') {
        try {
          const subs = await HierarchyAPI.getUserSubordinates(user.id);
          if (mounted) setUsers(subs || []);
        } catch (err) {
          console.error('Failed to load subordinate users', err);
          if (mounted) setUsers([]);
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        await fetchUsers();
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [initialized, canNavigateAdmin, user?.hierarchyId, user?.role, canViewUserList, user?.id]);

  const mayors = users.filter((u) => u.role === 'MAYOR');

  const handleDeleteUser = (userId: number | string) => {
    const user = users.find((u) => u.id === Number(userId));
    if (user) {
      setDeleteTarget({
        id: Number(userId),
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      });
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.instance.delete(`/users/${deleteTarget.id}`);
      // Refetch users to ensure UI is up to date
      await fetchUsers();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (e) {
      console.error('Failed to delete user', e);
      alert('Failed to delete user');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };



  const renderActiveTab = () => {
    switch (activeTab) {
      case 'users':
        return (
          <UserGrid
            loading={loading}
            mayors={mayors}
            users={users}
            canNavigateAdmin={canNavigateAdmin}
            onMayorClick={(id: number | string) => router.push(`/mayor-view/${id}`)}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'hierarchy':
        return (
          <HierarchyTreeView
            tree={hierarchyTree}
          />
        );
      default:
        return null;
    }
  };

  // Show hierarchy tabs only for users with hierarchy access
  const showHierarchyTabs = user?.hierarchyId && canNavigateAdmin;

  return (
    <MainTemplate>
      <GlobalNav />

      <ColWrapper>
        <Header />
        <ContentWrapper>
          <LeftPanel>
            {showHierarchyTabs && (
              <TabContainer>
                <Tab 
                  active={activeTab === 'users'} 
                  onClick={() => setActiveTab('users')}
                >
                  All Users
                </Tab>
                <Tab 
                  active={activeTab === 'hierarchy'} 
                  onClick={() => setActiveTab('hierarchy')}
                >
                  Hierarchy Tree
                </Tab>
              </TabContainer>
            )}
            
            <CityProvider>
              {renderActiveTab()}
            </CityProvider>
          </LeftPanel>


        </ContentWrapper>
      </ColWrapper>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        deleteTarget={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </MainTemplate>
  );
}
