import { useState, useMemo } from 'react';

export interface FilterableItem {
  slug: string;
  title: string;
  tags: string[];
  [key: string]: unknown;
}

interface Props {
  items: FilterableItem[];
  renderItem: (item: FilterableItem, index: number) => React.ReactNode;
  emptyMessage?: string;
}

export default function TagFilter({ items, renderItem, emptyMessage = 'No items found.' }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => item.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const visibleItems = useMemo(() => {
    if (!activeTag) return items;
    return items.filter((item) => item.tags.includes(activeTag));
  }, [items, activeTag]);

  function toggle(tag: string) {
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  return (
    <div className="tag-filter">
      {/* Tag chips */}
      <div className="tag-filter__chips" role="group" aria-label="Filter by tag">
        <button
          className={`tag ${!activeTag ? 'active' : ''}`}
          onClick={() => setActiveTag(null)}
          aria-pressed={!activeTag}
        >
          all
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag ${activeTag === tag ? 'active' : ''}`}
            onClick={() => toggle(tag)}
            aria-pressed={activeTag === tag}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="tag-filter__list">
        {visibleItems.length === 0 ? (
          <p className="tag-filter__empty text-secondary mono">{emptyMessage}</p>
        ) : (
          visibleItems.map((item, i) => renderItem(item, i))
        )}
      </div>

      <style>{`
        .tag-filter__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 40px;
        }

        .tag-filter__list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .tag-filter__empty {
          font-size: 0.875rem;
          margin-top: 40px;
        }
      `}</style>
    </div>
  );
}
