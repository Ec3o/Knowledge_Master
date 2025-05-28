"use client"
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface InteractiveBoardProps {
  children: React.ReactNode;
  className?: string;
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;
}

export default function InteractiveBoard({
  children,
  className,
  minZoom = 0.1,
  maxZoom = 3,
  zoomSpeed = 0.1
}: InteractiveBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 1
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();

  // 找到内容的中心点
  const getContentCenter = useCallback(() => {
    if (!containerRef.current) return null;
    
    const container = containerRef.current;
    const content = container.querySelector('[data-mindmap-content]') as HTMLElement;
    
    if (!content) return null;
    
    // 获取容器尺寸
    const containerRect = container.getBoundingClientRect();
    
    // 获取内容的真实尺寸（包括所有子元素）
    const contentChildren = content.children;
    if (contentChildren.length === 0) return null;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    // 遍历所有子元素，计算边界
    Array.from(contentChildren).forEach(child => {
      const rect = (child as HTMLElement).getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      
      // 转换为相对于 content 的坐标
      const relativeLeft = rect.left - contentRect.left;
      const relativeTop = rect.top - contentRect.top;
      const relativeRight = relativeLeft + rect.width;
      const relativeBottom = relativeTop + rect.height;
      
      minX = Math.min(minX, relativeLeft);
      minY = Math.min(minY, relativeTop);
      maxX = Math.max(maxX, relativeRight);
      maxY = Math.max(maxY, relativeBottom);
    });
    
    if (minX === Infinity) return null;
    
    // 计算内容的实际中心点
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;
    
    // 计算容器的中心点
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;
    
    return {
      contentCenter: { x: contentCenterX, y: contentCenterY },
      containerCenter: { x: containerCenterX, y: containerCenterY },
      contentBounds: { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
    };
  }, []);

  // 处理鼠标滚轮缩放
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 计算缩放
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newScale = Math.min(Math.max(transform.scale + delta, minZoom), maxZoom);
    
    if (newScale === transform.scale) return;
    
    // 计算缩放中心点
    const scaleRatio = newScale / transform.scale;
    const newX = mouseX - (mouseX - transform.x) * scaleRatio;
    const newY = mouseY - (mouseY - transform.y) * scaleRatio;
    
    setTransform({
      x: newX,
      y: newY,
      scale: newScale
    });
  }, [transform, minZoom, maxZoom, zoomSpeed]);

  // 处理鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只处理左键
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPanPoint({ x: transform.x, y: transform.y });
    
    // 防止文本选择
    e.preventDefault();
  }, [transform.x, transform.y]);

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setTransform(prev => ({
      ...prev,
      x: lastPanPoint.x + deltaX,
      y: lastPanPoint.y + deltaY
    }));
  }, [isDragging, dragStart, lastPanPoint]);

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 重置视图 - 将内容居中并重置缩放
  const resetView = useCallback(() => {
    const centerInfo = getContentCenter();
    
    if (!centerInfo) {
      // 如果无法计算内容中心，使用默认居中
      setTransform({ x: 0, y: 0, scale: 1 });
      return;
    }
    
    const { contentCenter, containerCenter } = centerInfo;
    
    // 计算将内容中心移动到容器中心所需的偏移量
    const offsetX = containerCenter.x - contentCenter.x;
    const offsetY = containerCenter.y - contentCenter.y;
    
    setTransform({
      x: offsetX,
      y: offsetY,
      scale: 1
    });
  }, [getContentCenter]);

  // 居中视图 - 保持当前缩放，只调整位置
  const centerView = useCallback(() => {
    const centerInfo = getContentCenter();
    
    if (!centerInfo) return;
    
    const { contentCenter, containerCenter } = centerInfo;
    
    // 考虑当前缩放比例
    const scaledContentCenterX = contentCenter.x * transform.scale;
    const scaledContentCenterY = contentCenter.y * transform.scale;
    
    const offsetX = containerCenter.x - scaledContentCenterX;
    const offsetY = containerCenter.y - scaledContentCenterY;
    
    setTransform(prev => ({
      ...prev,
      x: offsetX,
      y: offsetY
    }));
  }, [getContentCenter, transform.scale]);

  // 缩放到适合大小
  const fitToView = useCallback(() => {
    const centerInfo = getContentCenter();
    
    if (!centerInfo) return;
    
    const { contentBounds, containerCenter } = centerInfo;
    
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // 计算适合的缩放比例，留出一些边距
    const scaleX = (containerRect.width * 0.8) / contentBounds.width;
    const scaleY = (containerRect.height * 0.8) / contentBounds.height;
    const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), minZoom), maxZoom);
    
    // 计算缩放后的内容中心
    const contentCenter = {
      x: (contentBounds.minX + contentBounds.maxX) / 2,
      y: (contentBounds.minY + contentBounds.maxY) / 2
    };
    
    const scaledContentCenterX = contentCenter.x * newScale;
    const scaledContentCenterY = contentCenter.y * newScale;
    
    // 计算居中位置
    const offsetX = containerCenter.x - scaledContentCenterX;
    const offsetY = containerCenter.y - scaledContentCenterY;
    
    setTransform({
      x: offsetX,
      y: offsetY,
      scale: newScale
    });
  }, [getContentCenter, minZoom, maxZoom]);

  // 绑定事件监听器
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp, isDragging]);

  // 添加键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            resetView();
            break;
          case '=':
          case '+':
            e.preventDefault();
            setTransform(prev => ({ 
              ...prev, 
              scale: Math.min(prev.scale + zoomSpeed, maxZoom) 
            }));
            break;
          case '-':
            e.preventDefault();
            setTransform(prev => ({ 
              ...prev, 
              scale: Math.max(prev.scale - zoomSpeed, minZoom) 
            }));
            break;
          case '1':
            e.preventDefault();
            fitToView();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetView, fitToView, zoomSpeed, minZoom, maxZoom]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* 主容器 */}
      <div
        ref={containerRef}
        className={cn(
          "w-full h-full cursor-grab",
          isDragging && "cursor-grabbing",
          "bg-background"
        )}
        onMouseDown={handleMouseDown}
        style={{
          backgroundImage: theme === 'dark' 
            ? 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: `${transform.x % 20}px ${transform.y % 20}px`
        }}
      >
        {/* 内容容器 */}
        <div
          data-mindmap-content
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {children}
        </div>
      </div>

      {/* 控制面板 */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setTransform(prev => ({ 
                ...prev, 
                scale: Math.min(prev.scale + zoomSpeed, maxZoom) 
              }))}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted rounded transition-colors"
              title="放大 (Ctrl/Cmd + +)"
            >
              +
            </button>
            <div className="text-xs text-center text-muted-foreground py-1">
              {Math.round(transform.scale * 100)}%
            </div>
            <button
              onClick={() => setTransform(prev => ({ 
                ...prev, 
                scale: Math.max(prev.scale - zoomSpeed, minZoom) 
              }))}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted rounded transition-colors"
              title="缩小 (Ctrl/Cmd + -)"
            >
              -
            </button>
          </div>
        </div>
        
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
          <div className="flex flex-col gap-1">
            {/* <button
              onClick={fitToView}
              className="px-2 py-1 text-xs text-foreground hover:bg-muted rounded transition-colors"
              title="适合视图 (Ctrl/Cmd + 1)"
            >
              适合
            </button>
            <button
              onClick={centerView}
              className="px-2 py-1 text-xs text-foreground hover:bg-muted rounded transition-colors"
              title="居中"
            >
              居中
            </button> */}
            <button
              onClick={resetView}
              className="px-2 py-1 text-xs text-foreground hover:bg-muted rounded transition-colors"
              title="重置视图 (Ctrl/Cmd + 0)"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 小地图 */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="w-32 h-20 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
          <div 
            className="w-full h-full bg-muted/30 rounded relative overflow-hidden cursor-pointer"
            onClick={centerView}
            title="点击居中"
            style={{
              backgroundImage: theme === 'dark' 
                ? 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)'
                : 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
              backgroundSize: '4px 4px'
            }}
          >
            <div 
              className="absolute bg-primary/30 border border-primary/50 transition-all duration-200"
              style={{
                left: `${Math.max(0, Math.min(80, (transform.x + 200) / 20))}%`,
                top: `${Math.max(0, Math.min(60, (transform.y + 100) / 10))}%`,
                width: `${Math.max(5, Math.min(40, 80 / transform.scale))}%`,
                height: `${Math.max(5, Math.min(40, 60 / transform.scale))}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}