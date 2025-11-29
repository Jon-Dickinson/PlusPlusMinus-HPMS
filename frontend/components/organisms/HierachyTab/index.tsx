import React from 'react';
import HierarchyTreeView from '../HierarchyTreeView';

type Props = {
  tree: any[];
};

export default function HierarchyTab({ tree }: Props) {
  return <HierarchyTreeView tree={tree} />;
}
