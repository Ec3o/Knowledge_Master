"use client"
import React, { useMemo } from 'react';
import { generateMindMapData } from '../layouts';
import { ISource, IMindMap, IConnectionType } from '../layouts/types';
import ConnectionLine from '../components/ConnectionLine';
import TreeRoot from './TreeRoot';
import BlockViewer from '../components/BlockViewer';
import InteractiveBoard from './InteractiveBoard';
import { structureMap } from '../layouts/structures';

interface IProps {
  source: string;
  structure: string;
  connectionType: IConnectionType;
}

const VIEW_BLOCK = false;

const Board: React.FC<IProps> = ({ source, structure, connectionType }) => {
  const data: IMindMap | null = useMemo(() => {
    try {
      if (!source || !structure || !structureMap[structure]) {
        console.warn('Missing required props:', { source: !!source, structure, connectionType });
        return null;
      }
      return generateMindMapData(source, structure);
    } catch (error) {
      console.error('Error generating mind map data:', error);
      return null;
    }
  }, [source, structure]);

  console.log('Board data:', data ? 'generated' : 'null');

  if (!source || data === null) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-muted-foreground">
          {!source ? '等待数据加载...' : '数据解析失败'}
        </div>
      </div>
    );
  }

  const { root, connections } = data;
  const rootBlockHeight = root.blockSize.height;
  const rootBlockWidth = root.blockSize.width;

  return (
    <InteractiveBoard className="w-full h-full">
      <div 
        style={{
          position: 'relative',
          height: rootBlockHeight,
          width: rootBlockWidth,
          margin: 18,
        }}
      >
        {VIEW_BLOCK && (
          <BlockViewer
            containerHeight={rootBlockHeight}
            containerWidth={rootBlockWidth}
            root={root}
          />
        )}

        {connections && (
          <ConnectionLine
            containerHeight={rootBlockHeight}
            containerWidth={rootBlockWidth}
            connections={connections}
            connectionType={connectionType}
          />
        )}

        <TreeRoot rootNode={root} />
      </div>
    </InteractiveBoard>
  );
};

export default Board;