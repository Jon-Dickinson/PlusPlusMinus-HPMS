import React from 'react';
import { TabContainer, Tab } from '../../pages/user-list/styles';

type Props = {
  activeTab: 'users' | 'hierarchy';
  setActiveTab: (t: 'users' | 'hierarchy') => void;
  showHierarchyTabs: boolean;
};

export default function Tabs({ activeTab, setActiveTab, showHierarchyTabs }: Props) {
  if (!showHierarchyTabs) return null;

  return (
    <TabContainer>
      <Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
        All Users
      </Tab>
      <Tab active={activeTab === 'hierarchy'} onClick={() => setActiveTab('hierarchy')}>
        Hierarchy Tree
      </Tab>
    </TabContainer>
  );
}
