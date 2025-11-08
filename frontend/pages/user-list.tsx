import React, { useEffect, useState } from 'react';
import MainTemplate from '../components/templates/MainTemplate';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { CityProvider } from '../components/organisms/CityContext';
import Header from '../components/molecules/Header';
import GlobalNav from '../components/molecules/GlobalNav';
import UserGrid from '../components/molecules/UserGrid';
import DeleteConfirmationModal from '../components/molecules/DeleteConfirmationModal';
import axios from '../lib/axios';
import useAuthorized from '../hooks/useAuthorized';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  mayorId?: number;
}

const ColWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;


export default function UserList() {
  const router = useRouter();

  const canNavigateAdmin = useAuthorized(['ADMIN']);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
    role: string;
  } | null>(null);

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
      if (!canNavigateAdmin) {
        // Not authorized to view the users list — avoid making the API call.
        if (mounted) {
          setUsers([]);
          setLoading(false);
        }
        return;
      }

      await fetchUsers();
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [initialized, canNavigateAdmin]);

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

  return (
    <MainTemplate>
      <GlobalNav />

      <ColWrapper>
        <Header />
        <ColWrapper>
          <CityProvider>
            <UserGrid
              loading={loading}
              mayors={mayors}
              users={users}
              canNavigateAdmin={canNavigateAdmin}
              onMayorClick={(id: number | string) => router.push(`/mayor-view/${id}`)}
              onDeleteUser={handleDeleteUser}
            />
          </CityProvider>
        </ColWrapper>
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
