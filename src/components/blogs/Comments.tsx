import React from "react";
import Giscus from "@giscus/react";

const Comments: React.FC = () => {
  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>Comments</h3>
        <p className="comments-subtitle">
          Share your thoughts and engage with the community
        </p>
      </div>
      <Giscus
        id="comments"
        repo={import.meta.env.VITE_GISCUS_REPO || ""}
        repoId={import.meta.env.VITE_GISCUS_REPO_ID || ""}
        category={import.meta.env.VITE_GISCUS_CATEGORY || ""}
        categoryId={import.meta.env.VITE_GISCUS_CATEGORY_ID || ""}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="dark"
        lang="en"
        loading="lazy"
      />
    </div>
  );
};

export default Comments;
