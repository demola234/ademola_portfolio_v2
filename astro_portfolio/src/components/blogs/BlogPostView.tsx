import { useState } from "react";
import Comments from "./Comments";
import MarkdownViewer from "./MarkdownViewer";
import SocialShare from "../SocialShare";
import TableOfContents from "./TableOfContents";
import Footer from "../../components/layout/Footer";
import Tag from "./Tag";
import { Medium, WeirdImage } from "../../assets/svg.tsx";

const BlogPostView = ({ post, markdownContent, readingTime, currentUrl, prevPost, nextPost }) => {
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);

  return (
    <div className="blog-post-container">
      <div className="blog-header-actions">
        {post.medium_blog_link && (
          <a
            href={post.medium_blog_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-x-2 sm:gap-x-3 w-auto rounded-full bg-white/5 hover:bg-white/10 items-center px-4 py-2.5 sm:px-5 sm:py-2.5 transition-colors"
          >
            <Medium />
            <p className="text-sm font-medium">Read on Medium</p>
          </a>
        )}
        {post.medium_blog_link && <span className="blog-separator">|</span>}
        <div className="blog-social-share-inline">
          <SocialShare
            url={currentUrl}
            title={post.title}
            description={post.short_description}
          />
        </div>
      </div>
      <div className="relative bg-[#090909] px-3 sm:px-5 md:px-6 mt-3 py-6 sm:py-9">
        <h2 className="text-xl font-bold sm:text-3xl">{post.title}</h2>
        <p className="text-sm font-semibold">
          {new Date(post.publish_date).toDateString()}
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex flex-wrap gap-2">
            {post.tags &&
              post.tags.map((tech: string, i: number) => (
                <Tag key={i}>{tech}</Tag> // Use Tag component
              ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-medium">
              {readingTime > 0 ? readingTime : post.reading_time} min read
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0">
          <WeirdImage />
        </div>
      </div>
      {/* Mobile TOC Toggle Button */}
      {markdownContent && (
        <button
          onClick={() => setIsTocOpen(true)}
          className="toc-mobile-toggle"
          aria-label="Open Table of Contents"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Contents</span>
        </button>
      )}

      <div className="blog-content-wrapper">
        <div className="blog-main-content">
          <div className="blog-image-container">
            {post.image_url ? (
              <img
                src={post.image_url}
                alt={post.title || "Blogs post image"}
                className="blog-featured-image"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="blog-image-placeholder">
                Coming Soon
              </div>
            )}
          </div>
          {post.markdown_path ? (
            <MarkdownViewer filePath={post.markdown_path} />
          ) : (
            <p className="mt-5 text-center text-gray-700 text-lg">
              Content Coming Soon
            </p>
          )}
          <Comments />
        </div>
        {markdownContent && (
          <aside className="blog-sidebar">
            <TableOfContents
              content={markdownContent} // Pass content
              isOpen={isTocOpen}
              onClose={() => setIsTocOpen(false)}
            />
          </aside>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogPostView;