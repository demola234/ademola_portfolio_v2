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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true); // Start loading
    fetch(filePath)
      .then((response) => response.text())
      .then((text) => {
        setMarkdownContent(text);
        setIsLoading(false); // Stop loading
      })
      .catch((error) => {
        console.error("Error loading Markdown file:", error);
        setIsLoading(false); // Stop loading in case of error
      });
  }, [filePath]);

  return (
    <div className="markdown-container">
      {isLoading ? (
        <div className="shimmer-container">
          <div className="shimmer-line"></div>
          <div className="shimmer-line"></div>
          <div className="shimmer-line"></div>
          <div className="shimmer-line short"></div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default MarkdownViewer;
