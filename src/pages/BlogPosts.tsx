// import React from "react";
import SemiNavbar from "../components/home/SemiNavbar";
import PostsMade from "../components/blog/sections/PostsMade";
import { useEffect } from "react";

const BlogPosts = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
  return (
    <div>
      <SemiNavbar />
      <PostsMade />
    </div>
  );
};

export default BlogPosts;
