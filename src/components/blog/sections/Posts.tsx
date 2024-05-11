import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";

const Posts = () => {
  const [postContent, setPostContent] = useState("");

  useEffect(() => {
    import("../contents/article.md").then((res) => {
      fetch(res.default)
        .then((response) => response.text())
        .then((response) => setPostContent(response))
        .catch((err) => console.log(err));
    });
  }, []);
  const markdownOptions = {
    overrides: {
      h1: { props: { className: "text-4xl font-bold" } },
      h2: { props: { className: "text-xl font-semibold" } },
      h3: { props: { className: "text-lg font-medium" } },
      p: { props: { className: "mb-4" } },
      strong: { props: { className: "font-bold" } },
      em: { props: { className: "italic" } },
    },
  };

  return (
    <div>
      <Markdown options={markdownOptions}>{postContent}</Markdown>
    </div>
  );
};

export default Posts;
