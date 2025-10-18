// Virtual list component for performance optimization with large datasets

import { memo, useMemo, useCallback, useRef, useState } from 'react';
import { Box, Stack } from '@chakra-ui/react';
import { useListPerformance } from '../../hooks/usePerformance';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  measureName?: string;
}

function VirtualListComponent<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  overscan = 5,
  className,
  onScroll,
  measureName = 'virtual_list',
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { visibleCount, shouldVirtualize } = useListPerformance(
    items,
    itemHeight,
    containerHeight,
    measureName
  );

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!shouldVirtualize) {
      return { start: 0, end: items.length };
    }

    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + visibleCount + overscan,
      items.length
    );

    return {
      start: Math.max(0, start - overscan),
      end,
    };
  }, [scrollTop, itemHeight, visibleCount, overscan, items.length, shouldVirtualize]);

  // Get visible items
  const visibleItems = useMemo(() => {
    if (!shouldVirtualize) {
      return items.map((item, index) => ({ item, index }));
    }

    return items
      .slice(visibleRange.start, visibleRange.end)
      .map((item, relativeIndex) => ({
        item,
        index: visibleRange.start + relativeIndex,
      }));
  }, [items, visibleRange, shouldVirtualize]);

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight;
  const offsetY = shouldVirtualize ? visibleRange.start * itemHeight : 0;

  // If virtualization is not needed, render all items normally
  if (!shouldVirtualize) {
    return (
      <Box
        ref={containerRef}
        height={containerHeight}
        overflowY="auto"
        className={className}
        onScroll={handleScroll}
      >
        <Stack gap={0} align="stretch">
          {visibleItems.map(({ item, index }) => (
            <Box key={keyExtractor(item, index)} height={itemHeight}>
              {renderItem(item, index)}
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      height={containerHeight}
      overflowY="auto"
      className={className}
      onScroll={handleScroll}
    >
      <Box height={totalHeight} position="relative">
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          transform={`translateY(${offsetY}px)`}
        >
          <Stack gap={0} align="stretch">
            {visibleItems.map(({ item, index }) => (
              <Box key={keyExtractor(item, index)} height={itemHeight}>
                {renderItem(item, index)}
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export const VirtualList = memo(VirtualListComponent) as typeof VirtualListComponent;

// Hook for easy virtual list usage
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  options: {
    overscan?: number;
    threshold?: number;
    measureName?: string;
  } = {}
) {
  const { overscan = 5, threshold = 50, measureName } = options;

  const shouldVirtualize = items.length > threshold;

  const { visibleCount, bufferSize } = useListPerformance(
    items,
    itemHeight,
    containerHeight,
    measureName
  );

  const VirtualListComponent = useCallback(
    (listProps: Omit<VirtualListProps<T>, 'items' | 'itemHeight' | 'containerHeight'>) => {
      return (
        <VirtualList
          items={items}
          itemHeight={itemHeight}
          containerHeight={containerHeight}
          overscan={overscan}
          measureName={measureName}
          {...listProps}
        />
      );
    },
    [items, itemHeight, containerHeight, overscan, measureName]
  );

  return {
    shouldVirtualize,
    visibleCount,
    bufferSize,
    VirtualList: VirtualListComponent,
  };
}

// Performance-optimized grid component
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  gap?: number;
  overscan?: number;
  measureName?: string;
}

export const VirtualGrid = memo(function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  keyExtractor,
  gap = 0,
  overscan = 5,
  measureName = 'virtual_grid',
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate columns and rows
  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const rowHeight = itemHeight + gap;

  const { shouldVirtualize } = useListPerformance(
    items,
    rowHeight,
    containerHeight,
    measureName
  );

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!shouldVirtualize) {
      return { start: 0, end: totalRows };
    }

    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      startRow + Math.ceil(containerHeight / rowHeight) + overscan,
      totalRows
    );

    return {
      start: Math.max(0, startRow - overscan),
      end: endRow,
    };
  }, [scrollTop, rowHeight, containerHeight, overscan, totalRows, shouldVirtualize]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const startIndex = visibleRange.start * columnsPerRow;
    const endIndex = Math.min(visibleRange.end * columnsPerRow, items.length);

    return items
      .slice(startIndex, endIndex)
      .map((item, relativeIndex) => ({
        item,
        index: startIndex + relativeIndex,
        row: Math.floor((startIndex + relativeIndex) / columnsPerRow),
        col: (startIndex + relativeIndex) % columnsPerRow,
      }));
  }, [items, visibleRange, columnsPerRow]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const totalHeight = totalRows * rowHeight;
  const offsetY = shouldVirtualize ? visibleRange.start * rowHeight : 0;

  return (
    <Box
      height={containerHeight}
      overflowY="auto"
      onScroll={handleScroll}
    >
      <Box height={totalHeight} position="relative">
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          transform={`translateY(${offsetY}px)`}
        >
          {visibleItems.map(({ item, index, row, col }) => (
            <Box
              key={keyExtractor(item, index)}
              position="absolute"
              left={col * (itemWidth + gap)}
              top={(row - visibleRange.start) * rowHeight}
              width={itemWidth}
              height={itemHeight}
            >
              {renderItem(item, index)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});

export type { VirtualListProps, VirtualGridProps };