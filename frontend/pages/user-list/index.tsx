import React from 'react';
import MainTemplate from '../../components/templates/MainTemplate';
import { useRouter } from 'next/router';
import { CityProvider } from '../../components/organisms/CityContext';
import Header from '../../components/molecules/Header';
import GlobalNav from '../../components/molecules/GlobalNav';
import useAuthorized from '../../hooks/useAuthorized';
import useUserList from '../../hooks/useUserList';
import { ColWrapper, ContentWrapper, LeftPanel } from '../../components/pages/user-list/styles';
import Tabs from '../../components/atoms/Tabs';
import UserTab from '../../components/molecules/UserTab';
import HierarchyTab from '../../components/organisms/HierachyTab';
import DeleteModal from '../../components/molecules/DeleteModal';
import HeaderSection from '../../components/molecules/HeaderSection';
import useUserOrdering from '../../hooks/useUserOrdering';
import useDeleteUser from '../../hooks/useDeleteUser';
import { computeVisibleUsers } from '../../utils/computeVisibleUsers';

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

	const showHierarchyTabs = !!(user?.hierarchyId && canNavigateAdmin);

		useUserOrdering({ users, hierarchyTree, loading, hierarchyLoading, setOrderedUsers });

	const { displayUsers, mayors, isOrdering } = computeVisibleUsers(orderedUsers);

	// When logged in as a MAYOR viewing the user-list page, hide delete buttons
	const showDeleteButtons = !(user?.role === 'MAYOR' && router.pathname === '/user-list');

	const { handleDeleteUser, confirmDelete, cancelDelete } = useDeleteUser({
		displayUsers,
		setDeleteTarget,
		setShowDeleteModal,
		refetchUsers,
		deleteTarget,
	});

	// renderActiveTab handled by composed components below

	return (
		<MainTemplate>
			<GlobalNav />

			<ColWrapper>
				<HeaderSection />
				<ContentWrapper>
					<LeftPanel>
						<Tabs activeTab={activeTab} setActiveTab={setActiveTab} showHierarchyTabs={showHierarchyTabs} />

						<CityProvider>
							{activeTab === 'users' ? (
								<UserTab
									loading={loading}
									isOrdering={isOrdering}
									mayors={mayors}
									users={displayUsers}
									canNavigateAdmin={canNavigateAdmin}
									onMayorClick={(id) => router.push(`/mayor-view/${id}`)}
									  onDeleteUser={showDeleteButtons ? handleDeleteUser : undefined}
								/>
							) : (
								<HierarchyTab tree={hierarchyTree} />
							)}
						</CityProvider>
					</LeftPanel>
				</ContentWrapper>
			</ColWrapper>

			<DeleteModal isOpen={showDeleteModal} deleteTarget={deleteTarget} onConfirm={confirmDelete} onCancel={cancelDelete} />
		</MainTemplate>
	);
}
