import React, { FC } from 'react'
import { useState } from 'react'
import { CirclePlus, MinusCircle, PlusCircle} from 'lucide-react'
import Topic from '../components/Topic'
import { INode, IBlockSize, IBlockPosition, IPosition, ISize } from '../layouts/types'

interface IProps {
  childNodes?: INode[]
  blockSize: IBlockSize
  blockPosition: IBlockPosition
  position: IPosition
  size: ISize
}

const TreeNode: FC<IProps> = (props) => {
  const { childNodes = [], children } = props
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => {
    setIsExpanded(!isExpanded); // 切换展开/折叠状态
  };

  return (
    <>
      {children}
      {childNodes.length > 0 ? childNodes.map(node => (
        <TreeNode
          key={node.id}
          childNodes={node.children}
          blockSize={node.blockSize}
          blockPosition={node.blockPosition}
          position={node.position}
          size={node.size}
        >
          <Topic
            title={node.title}
            position={node.position}
            size={node.size}
          />
        </TreeNode>
        
      )) : null}

    </>
  )
}

export default TreeNode
