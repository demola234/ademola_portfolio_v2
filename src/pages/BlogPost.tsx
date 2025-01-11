import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Medium, WeirdImage } from "../assets/svg";
import MarkdownViewer from "../components/blogs/MarkdownViewer";
import { posts } from "../data/posts";
import Footer from "../layout/rootLayout/Footer";

const BlogsPost = () => {
  const { title } = useParams<{ title: string }>();

  // State to track scroll position
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Find the specific post based on the title
  const post = posts?.find((post) => post.title === title);

  console.log("filePath:", post);
  console.log(post?.markdown_path);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    const handleScroll = () => {
      // Show the button if scrolled down 300px
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!post) {
    return <p className="mt-10 text-xl text-center">Post not found.</p>;
  }

  return (
    <div className="flex flex-col">
      <Link
        to="/blogs"
        className="block py-2 text-primaryDefault hover:text-white flex items-center self-start"
      >
        <span>&lt;</span>
        Back to Blog
      </Link>
      {post.medium_blog_link && (
        <a
          href={post.medium_blog_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-x-[12px] w-auto self-start rounded-full bg-white/5 items-center px-[19px] py-[10px]"
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
          {/* Time read */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-xs font-medium">{post.reading_time} min read</p>
          </div>
        </div>
        <div className="absolute top-0 right-0">
          <WeirdImage />
        </div>
      </div>
      <div className="w-full">
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title || "Blogs post image"}
            className="object-cover object-top w-full h-full aspect-video"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-60 bg-gray-200 text-gray-700 text-lg">
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
      <Footer />
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 p-3 bg-primaryDefault text-white rounded-full shadow-lg hover:bg-primaryHover transition-all duration-300"
        >
          ↑ Back to Top
        </button>
      )}
    </div>
  );
};

export default BlogsPost;
