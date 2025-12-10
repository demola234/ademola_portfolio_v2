import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import LanguageIcon from "./LanguageIcon";

interface MarkdownViewerProps {
  filePath: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ filePath }) => {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [_, setFileType] = useState<string>("Unknown");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string>("");

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setShowDialog(true);
      setTimeout(() => {
        setShowDialog(false);
        setCopiedCode("");
      }, 3000);
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
          img({ node, ...props }: any) {
            return (
              <img
                {...props}
                loading="lazy"
                decoding="async"
                style={{ maxWidth: "100%", height: "auto", display: "block", margin: "1.5rem auto" }}
              />
            );
          },
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : null;
            const code = String(children).replace(/\n$/, "");
            return !inline && language ? (
              <div className="code-block">
                <div className="code-header">
                  <div className="code-language">
                    <LanguageIcon language={language} />
                    <span>{language}</span>
                  </div>
                  <button
                    className={`copy-button ${copiedCode === code ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(code)}
                  >
                    {copiedCode === code ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M11.6667 3.5L5.25 9.91667L2.33334 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M10 4V2.5C10 1.67157 9.32843 1 8.5 1H2.5C1.67157 1 1 1.67157 1 2.5V8.5C1 9.32843 1.67157 10 2.5 10H4" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={a11yDark}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem 1.75rem',
                    background: '#1a1a1a',
                    borderRadius: '0',
                  }}
                  codeTagProps={{
                    style: {
                      borderRadius: '0',
                    }
                  }}
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
