// import React from "react";
import { useEffect } from "react";
import PostsMade from "../components/blogs/sections/PostsMade";
import SemiNavbar from "../components/home/SemiNavbar";
import Footer from "../layout/rootLayout/Footer";

const BlogsPosts = () => {
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
      <Footer />
    </div>
  );
};

export default BlogsPosts;
