import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  filePath: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ filePath }) => {
  const [markdownContent, setMarkdownContent] = useState<string>("");

  // console.log("filePath:", filePath);

  useEffect(() => {
    fetch(
      "https://github.com/shefihu/ademola_portfolio/blob/ffaf6f95b0624e45d7afb517edcb42fe0d37ded8/src/components/blogs/contents/article.md"
    )
      .then((response) => response.text())
      .then((text) => setMarkdownContent(text))
      .catch((error) => console.error("Error loading Markdown file:", error));
  }, [
    "https://github.com/shefihu/ademola_portfolio/blob/ffaf6f95b0624e45d7afb517edcb42fe0d37ded8/src/components/blogs/contents/article.md",
  ]);

  return (
    <div className="markdown-container">
      <ReactMarkdown
        children={markdownContent}
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : null;
            return !inline && language ? (
              <div className="code-block">
                <div className="code-language">{language}</div>
                <SyntaxHighlighter
                  style={a11yDark}
                  language={language}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={`inline-code ${className}`} {...props}>
                {children}
              </code>
            );
          },
        }}
      />
    </div>
  );
};

export default MarkdownViewer;
