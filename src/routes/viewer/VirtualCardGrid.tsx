// The virtualizer returns unstable function identities that React Compiler would
// memoize away, so this component opts out.
"use no memo";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

const MIN_COLUMN_WIDTH = 300;
const GAP = 16;
const ESTIMATED_ROW_HEIGHT = 620;

interface Props<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
}

export function VirtualCardGrid<T>({ items, renderItem }: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setColumns(
        Math.max(1, Math.floor((el.clientWidth + GAP) / (MIN_COLUMN_WIDTH + GAP))),
      );
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    gap: GAP,
    overscan: 2,
    scrollMargin,
  });

  return (
    <div
      ref={containerRef}
      style={{ height: virtualizer.getTotalSize(), position: "relative" }}
    >
      {virtualizer.getVirtualItems().map((row) => {
        const start = row.index * columns;
        return (
          <div
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${row.start - scrollMargin}px)`,
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: GAP,
            }}
          >
            {items
              .slice(start, start + columns)
              .map((item, i) => renderItem(item, start + i))}
          </div>
        );
      })}
    </div>
  );
}
