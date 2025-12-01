import React, { useCallback } from 'react';
import { TabContainer, Tab } from '../../pages/user-list/styles';

type Props = {
  activeTab: 'users' | 'hierarchy';
  setActiveTab: (t: 'users' | 'hierarchy') => void;
  showHierarchyTabs: boolean;
};

export default function Tabs({ activeTab, setActiveTab, showHierarchyTabs }: Props) {
  const handleUsersClick = useCallback(() => setActiveTab('users'), [setActiveTab]);
  const handleHierarchyClick = useCallback(() => setActiveTab('hierarchy'), [setActiveTab]);

  if (!showHierarchyTabs) return null;

  return (
    <TabContainer>
      <Tab active={activeTab === 'users'} onClick={handleUsersClick}>
        All Users
      </Tab>
      <Tab active={activeTab === 'hierarchy'} onClick={handleHierarchyClick}>
        Hierarchy Tree
      </Tab>
    </TabContainer>
  );
}
