import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  filePath: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ filePath }) => {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [_, setFileType] = useState<string>("Unknown");
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 5000);
    });
  };

  useEffect(() => {
    const extension = filePath.split(".").pop()?.toLowerCase();
    setFileType(extension === "md" ? "Markdown" : "Unknown");

    fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => setMarkdownContent(text))
      .catch((error) => console.error("Error loading Markdown file:", error));
  }, [filePath]);

  return (
    <div className="markdown-container">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        children={markdownContent}
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : null;
            const code = String(children).replace(/\n$/, "");
            return !inline && language ? (
              <div className="code-block">
                <div className="code-header">
                  <span className="code-language">{language}</span>
                  <button
                    className="copy-button"
                    onClick={() => copyToClipboard(code)}
                  >
                    Copy Code
                  </button>
                </div>
                <SyntaxHighlighter
                  style={a11yDark}
                  language={language}
                  PreTag="div"
                  {...props}
                >
                  {code}
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
      {/* Sliding dialog */}
      {showDialog && (
        <div className="sliding-dialog">
          <p>Code copied to clipboard!</p>
        </div>
      )}
    </div>
  );
};

export default MarkdownViewer;
