import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import slugify from "slugify";
import { Medium, WeirdImage } from "../assets/svg";
import Comments from "../components/blogs/Comments";
import MarkdownViewer from "../components/blogs/MarkdownViewer";
import TableOfContents from "../components/blogs/TableOfContents";
import { posts } from "../data/posts";
import Footer from "../layout/rootLayout/Footer";
import { umami } from "../utils/umami";
import { calculateReadingTime } from "../utils/readingTime";

const BlogsPost = () => {
  const { title } = useParams<{ title: string }>();
  const decodedTitle = decodeURIComponent(title || "");
  const [readingTime, setReadingTime] = useState<number>(0);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);

  // Find the post by comparing the slugified title
  const post = posts.find((post) => {
    const slug = slugify(post.title, {
      lower: true,
      strict: true,
    });
    return slug === decodedTitle;
  });

  // Fetch markdown content and calculate reading time
  useEffect(() => {
    if (post?.markdown_path) {
      fetch(post.markdown_path)
        .then((response) => response.text())
        .then((text) => {
          setMarkdownContent(text);
          const calculatedTime = calculateReadingTime(text);
          setReadingTime(calculatedTime);
        })
        .catch((error) => {
          console.error("Error calculating reading time:", error);
          // Fallback to static reading time if fetch fails
          setReadingTime(Number(post.reading_time) || 5);
        });
    }
  }, [post]);

  // Scroll to top on page load and track blog view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Track blog view with Umami (no API required, just client-side tracking)
    if (post && readingTime > 0) {
      umami.trackBlogView(
        post.title,
        decodedTitle,
        String(readingTime),
        post.tags
      );
    }
  }, [post, decodedTitle, readingTime]);

  if (!post) {
    return (
      <div className="mt-10 text-center">
        <Helmet>
          <title>Blog Not Found - My Blog</title>
          <meta
            name="description"
            content="The blog post you are looking for was not found."
          />
        </Helmet>
        <p className="text-xl">Post not found.</p>
        <Link to="/blogs" className="text-primaryDefault hover:underline">
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="blog-post-container">
      <Helmet>
        <title>{post.title} - My Blog</title>
        <meta
          name="description"
          content={
            post.short_description || "Read more about this topic on our blog."
          }
        />
        <meta property="og:title" content={post.title} />
        <meta
          property="og:description"
          content={post.short_description || "Discover insightful content."}
        />
        <meta
          property="og:image"
          content={post.image_url || "/default-image.png"}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta
          name="twitter:description"
          content={post.short_description || "Explore this post on our blog."}
        />
        <meta
          name="twitter:image"
          content={post.image_url || "/default-image.png"}
        />
      </Helmet>
      <Link
        to="/blogs"
        className="block py-2 text-primaryDefault hover:text-white flex items-center self-start"
      >
        <span>&lt;</span> Back to Blog
      </Link>
      {post.medium_blog_link && (
        <a
          href={post.medium_blog_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-x-[12px] w-auto self-start rounded-full bg-white/5 items-center px-[19px] py-[10px]"
          onClick={() => umami.trackMediumClick(post.title)}
        >
          <Medium />
          <p className="text-[12px]">Read on Medium</p>
        </a>
      )}
      <div className="relative bg-[#090909] px-7 mt-3 py-9">
        <h2 className="text-xl font-bold sm:text-3xl">{post.title}</h2>
        <p className="text-xs font-semibold">
          {new Date(post.publish_date).toDateString()}
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex flex-wrap gap-2">
            {post.tags &&
              post.tags.map((tech: string, i: number) => (
                <div
                  className="text-xs font-medium p-[10px_24px] bg-[rgb(255,255,255,0.10)] rounded-[11px]"
                  key={i}
                >
                  {tech}
                </div>
              ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-xs font-medium">
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
          <Comments postTitle={post.title} />
        </div>
        {markdownContent && (
          <aside className="blog-sidebar">
            <TableOfContents
              content={markdownContent}
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

export default BlogsPost;
