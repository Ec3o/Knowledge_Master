// mind-map-flow.tsx
import React from 'react';
import Board from './containers/Board';
import { STRUCTURES } from './layouts/structures/index';
import { IConnectionType } from './layouts/types';

interface MindMapPageProps {
  mindMapData: string;
  structure: string;
  connectionType: IConnectionType;
  onMindMapDataChange: (data: string) => void;
  onStructureChange: (structure: string) => void;
  onConnectionTypeChange: (type: IConnectionType) => void;
  presetData: string[];
}

const MindMapPage: React.FC<MindMapPageProps> = ({
  mindMapData,
  structure,
  connectionType,
  onMindMapDataChange,
  onStructureChange,
  onConnectionTypeChange,
  presetData
}) => {
  return (
    <div>
      <Board
        source={mindMapData}
        structure={structure}
        connectionType={connectionType}
      />
    </div>
  );
};

export default MindMapPage;