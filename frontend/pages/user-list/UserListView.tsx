import React from 'react';
import MainTemplate from '../../components/templates/MainTemplate';
import { useRouter } from 'next/router';
import { CityProvider } from '../../components/organisms/CityContext';
import Header from '../../components/molecules/Header';
import GlobalNav from '../../components/molecules/GlobalNav';
import UserGrid from '../../components/molecules/UserGrid';
import DeleteConfirmationModal from '../../components/molecules/DeleteConfirmationModal';
import HierarchyTreeView from '../../components/organisms/HierarchyTreeView';
import axios from '../../lib/axios';
import useAuthorized from '../../hooks/useAuthorized';
import useUserList from '../../hooks/useUserList';
import buildOrderedUsers from '../../utils/buildOrderedUsers';
import { ColWrapper, ContentWrapper, LeftPanel, TabContainer, Tab } from '../../components/pages/user-list/styles';

export default function UserListView() {
  const router = useRouter();
  const canNavigateAdmin = useAuthorized(['ADMIN']);

  const {
    user,
    users,
    orderedUsers,
    setOrderedUsers,
    loading,
    refetchUsers,
    showDeleteModal,
    setShowDeleteModal,
    deleteTarget,
    setDeleteTarget,
    hierarchyTree,
    hierarchyLoading,
  } = useUserList();

  const [activeTab, setActiveTab] = React.useState<'users' | 'hierarchy'>('users');

  const showHierarchyTabs = user?.hierarchyId && canNavigateAdmin;

  React.useEffect(() => {
    if (loading || hierarchyLoading) {
      setOrderedUsers(null);
      return;
    }

    if (!users || users.length === 0) {
      setOrderedUsers([]);
      return;
    }

    if (!hierarchyTree || hierarchyTree.length === 0) {
      setOrderedUsers(users);
      return;
    }

    setOrderedUsers(buildOrderedUsers(hierarchyTree, users));
  }, [users, hierarchyTree, loading, hierarchyLoading, setOrderedUsers]);

  const displayUsers = orderedUsers !== null ? orderedUsers : [];
  const mayors = displayUsers.filter((u) => u.role === 'MAYOR');
  const isOrdering = orderedUsers === null;

  const handleDeleteUser = (userId: number | string) => {
    const target = displayUsers.find((u) => u.id === Number(userId));
    if (!target) return;
    setDeleteTarget({ id: Number(userId), name: `${target.firstName} ${target.lastName}`, role: target.role });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.instance.delete(`/users/${deleteTarget.id}`);
      await refetchUsers();
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
            loading={loading || isOrdering}
            mayors={mayors}
            users={displayUsers}
            canNavigateAdmin={canNavigateAdmin}
            onMayorClick={(id: number | string) => router.push(`/mayor-view/${id}`)}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'hierarchy':
        return <HierarchyTreeView tree={hierarchyTree} />;
      default:
        return null;
    }
  };

  return (
    <MainTemplate>
      <GlobalNav />

      <ColWrapper>
        <Header />
        <ContentWrapper>
          <LeftPanel>
            {showHierarchyTabs && (
              <TabContainer>
                <Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
                  All Users
                </Tab>
                <Tab active={activeTab === 'hierarchy'} onClick={() => setActiveTab('hierarchy')}>
                  Hierarchy Tree
                </Tab>
              </TabContainer>
            )}

            <CityProvider>{renderActiveTab()}</CityProvider>
          </LeftPanel>
        </ContentWrapper>
      </ColWrapper>

      <DeleteConfirmationModal isOpen={showDeleteModal} deleteTarget={deleteTarget} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </MainTemplate>
  );
}
