import React, { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];

    const extractedHeadings = matches.map((match, index) => {
      const level = match[1].length;
      const text = match[2].trim();
      const id = `heading-${index}`;

      return { id, text, level };
    });

    setHeadings(extractedHeadings);
  }, [content]);

  useEffect(() => {
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      // Add IDs to actual heading elements in the DOM
      const headingElements = document.querySelectorAll(
        ".markdown-container h1, .markdown-container h2, .markdown-container h3"
      );

      if (headingElements.length === 0) return;

      headingElements.forEach((element, index) => {
        element.id = `heading-${index}`;
      });

      // Track which headings are currently visible
      const visibleHeadings = new Set<string>();

      // Intersection Observer for active heading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleHeadings.add(entry.target.id);
            } else {
              visibleHeadings.delete(entry.target.id);
            }
          });

          // Set the first visible heading as active
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

      headingElements.forEach((element) => {
        observer.observe(element);
      });

      return () => {
        headingElements.forEach((element) => {
          observer.unobserve(element);
        });
      };
    }, 500);

    return () => clearTimeout(timer);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Auto-scroll active link into view in TOC
  useEffect(() => {
    if (activeId) {
      const activeLink = document.querySelector(`[data-toc-id="${activeId}"]`);
      if (activeLink) {
        activeLink.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [activeId]);

  if (headings.length === 0) return null;

  return (
    <div className="table-of-contents">
      <div className="toc-header">
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
      <nav className="toc-nav">
        {headings.map((heading) => (
          <button
            key={heading.id}
            data-toc-id={heading.id}
            onClick={() => scrollToHeading(heading.id)}
            className={`toc-link ${activeId === heading.id ? "active" : ""} toc-level-${heading.level}`}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TableOfContents;
