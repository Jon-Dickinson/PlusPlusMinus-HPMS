import React, { useEffect, useState } from 'react';
import MainTemplate from '../templates/MainTemplate';
import CityMap from '../components/organisms/CityMap';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { CityProvider } from '../components/organisms/CityContext';
import Header from '../components/molecules/Header';
import MayorCard from '../components/molecules/MayorCard';
import GlobalNav from '../components/molecules/GlobalNav';
import BuildingLogPanel from '../components/organisms/BuildingLogPanel';
import axios from '../lib/axios';
import { Trash2 } from 'lucide-react';

const MapPanel = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  min-height: 420px;
  width: 100%;
`;

import { useAuth } from '../context/AuthContext';
import { isAdmin, isMayor } from '../utils/roles';
import useAuthorized from '../hooks/useAuthorized';


export default function UserList() {
  const router = useRouter();
  const { user } = useAuth();

  const canNavigateAdmin = useAuthorized(['ADMIN']);

  const isActive = (path: string) => router.pathname === path;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string; role: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.instance.get('/users');
      setUsers(res.data || []);
    } catch (e) {
      console.error('Failed to load users', e);
      setUsers([]);
    }
  };

  useEffect(() => {
    let mounted = true;

    fetchUsers().then(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const mayors = users.filter(u => u.role === 'MAYOR');

  const handleDeleteUser = (userId: number | string) => {
    const user = users.find(u => u.id === Number(userId));
    if (user) {
      setDeleteTarget({ id: Number(userId), name: `${user.firstName} ${user.lastName}`, role: user.role });
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
           
              <GridHeader>
                <HeaderTitle>Mayors</HeaderTitle>
                <HeadingRow>
                  <HeadingLabel>Location</HeadingLabel>
                  <HeadingLabel>Mayor</HeadingLabel>
                  <HeadingLabelRight>Action</HeadingLabelRight>
                </HeadingRow>
              </GridHeader>

              <MayorGrid>
                {loading ? (
                  <Message>Loading users...</Message>
                ) : mayors.length === 0 ? (
                  <Message>No mayors found.</Message>
                ) : (
                  mayors.map((m: any) => {
                    const viewers = users.filter((u: any) => u.role === 'VIEWER' && u.mayorId === m.id);
                    return (
                      <MayorSection key={m.id}>
                        <MayorCard
                          id={m.id}
                          onClick={(id: number | string) => {
                            if (canNavigateAdmin) {
                              router.push(`/mayor-view/${id}`);
                            }
                          }}
                          onDelete={handleDeleteUser}
                        />
                        {viewers.length > 0 && (
                          <ViewersList>
                            <ViewersTitle>Viewers:</ViewersTitle>
                            {viewers.map((viewer: any) => (
                              <ViewerItem key={viewer.id}>
                                <span>{viewer.firstName} {viewer.lastName} ({viewer.username})</span>
                                <button onClick={() => handleDeleteUser(viewer.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                  <Trash2 size={14} />
                                </button>
                              </ViewerItem>
                            ))}
                          </ViewersList>
                        )}
                      </MayorSection>
                    );
                  })
                )}
              </MayorGrid>
          

          
      
          </CityProvider>
        </ColWrapper>
      </ColWrapper>

      {showDeleteModal && deleteTarget && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Confirm Delete</ModalTitle>
            <ModalMessage>
              Are you sure you want to delete {deleteTarget.role === 'MAYOR' ? 'Mayor' : 'Viewer'} {deleteTarget.name}?
              {deleteTarget.role === 'MAYOR' && ' This will also delete all associated viewers.'}
            </ModalMessage>
            <ModalButtons>
              <CancelButton onClick={cancelDelete}>Cancel</CancelButton>
              <DeleteButton onClick={confirmDelete}>Delete</DeleteButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </MainTemplate>
  );
}

const RowWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

const ColWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const GridHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 5px;

  h2 {
    font-size: 12px;
    margin: 0;
    color: #ffffff;
    font-weight: 400;
  }

  h3 {
    margin: 0;
    font-size: 18px;
    color: #ffffff;
    font-weight: 500;
    padding-left: 20px;
  }
`;

const GridContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;

const MayorGrid = styled.div`
  display: inline-flex;
  width: 100%;
  flex-direction: column;
  padding: 25px;
`;

const InfoColumn = styled.div`
  width: 100%;
  max-width: 240px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  padding: 80px 20px;
  gap: 1.5rem;
`;

const HeadingRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-items: center;
  padding: 0 25px 8px 25px;
  margin-top: 20px;
`;

const HeadingLabel = styled.div`
  color: rgba(255,255,255,0.85);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeadingLabelRight = styled(HeadingLabel)`
  text-align: right;
`;

const HeaderTitle = styled.div`
  margin: 0;
  font-size: 18px;
  color: #ffffff;
  font-weight: 500;
  padding-left: 20px;
`;

const Message = styled.div`
  color: #ffffff;
  padding: 1rem;
`;

const MayorSection = styled.div`
  margin-bottom: 20px;
`;

const ViewersList = styled.div`
  margin-left: 25px;
  margin-top: 10px;
`;

const ViewersTitle = styled.div`
  color: rgba(255,255,255,0.85);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const ViewerItem = styled.div`
  color: #ffffff;
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #192748;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  color: #ffffff;
`;

const ModalTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
`;

const ModalMessage = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  background: #6b7280;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #4b5563;
  }
`;

const DeleteButton = styled.button`
  background: #ef4444;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #dc2626;
  }
`;