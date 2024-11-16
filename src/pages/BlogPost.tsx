// import React from "react";

import { Link, useParams } from "react-router-dom";

import { posts } from "../data/posts";
import MarkdownViewer from "../components/blog/MarkdownViewer";
import { Medium, WeirdImage } from "../assets/svg";
import { useEffect } from "react";

const BlogPost = () => {
  const { title } = useParams<{ title: string }>();
  // Find the specific post based on the title
  const post = posts.find((post) => post.title === title);
  console.log(post);
  if (!post) {
    return <p className="mt-10 text-xl text-center">Post not found.</p>;
  }
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
  return (
    <div className="flex flex-col">
      <Link to=""></Link>
      <a
        href={post?.medium_article_link}
        target="_blank"
        className="flex gap-x-[12px] w-auto self-start rounded-full bg-white/5 items-center px-[19px] py-[10px]"
      >
        <Medium />
        <p className="text-[12px]">Read on medium</p>
      </a>
      <div className="relative bg-[#090909] px-7 mt-3 py-9">
        <h2 className="text-xl font-bold sm:text-3xl">{post?.title}</h2>
        <p className="text-xs font-semibold">
          {new Date(post.publish_date).toDateString()}
        </p>
        <div className="absolute top-0 right-0">
          <WeirdImage />
        </div>
      </div>
      <div className="w-full">
        <img
          src={post?.image_url}
          alt=""
          className="object-cover object-top w-full h-full aspect-video"
        />
      </div>
      {/* <Posts /> */}
      <MarkdownViewer filePath={post?.markdown_path} />
    </div>
  );
};

export default BlogPost;
