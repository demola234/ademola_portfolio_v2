import React, { useEffect, useState } from "react";

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface TableOfContentsProps {
  headings: Heading[];
  isOpen?: boolean;
  onClose?: () => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings, isOpen = true, onClose }) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeadings = new Set<string>();
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleHeadings.add(entry.target.id);
          } else {
            visibleHeadings.delete(entry.target.id);
          }
        });

        if (visibleHeadings.size > 0) {
          const firstVisible = Array.from(visibleHeadings).sort((a, b) => {
            const elemA = document.getElementById(a);
            const elemB = document.getElementById(b);
            if (!elemA || !elemB) return 0;
            return elemA.getBoundingClientRect().top - elemB.getBoundingClientRect().top;
          })[0];
          setActiveId(firstVisible);
        }
      },
      {
        rootMargin: "-10% 0% -70% 0%",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.slug);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  const scrollToHeading = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      if (onClose) {
        onClose();
      }
    }
  };

  useEffect(() => {
    if (activeId) {
      const activeLink = document.querySelector(`[data-toc-slug="${activeId}"]`);
      if (activeLink) {
        activeLink.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [activeId]);

  useEffect(() => {
    if (onClose && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (headings.length === 0) return null;

  return (
    <>
      {isOpen && onClose && (
        <div className="toc-overlay-backdrop" onClick={onClose} />
      )}

      <div className={`table-of-contents ${isOpen ? 'toc-open' : 'toc-closed'}`}>
        <div className="toc-header">
          <div className="toc-header-content">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4h12M2 8h12M2 12h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <h4>Table of Contents</h4>
          </div>
          {onClose && (
            <button onClick={onClose} className="toc-close-button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
        <nav className="toc-nav">
          {headings.map((heading) => (
            <button
              key={heading.slug}
              data-toc-slug={heading.slug}
              onClick={() => scrollToHeading(heading.slug)}
              className={`toc-link ${activeId === heading.slug ? "active" : ""} toc-level-${heading.depth}`}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default TableOfContents;
