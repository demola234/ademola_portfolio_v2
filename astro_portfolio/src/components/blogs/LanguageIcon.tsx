import React from "react";

interface LanguageIconProps {
  language: string;
}

const LanguageIcon: React.FC<LanguageIconProps> = ({ language }) => {
  const lang = language.toLowerCase();

  // Color mapping for different languages
  const colors: { [key: string]: string } = {
    go: "#00ADD8",
    dart: "#00D2B8",
    typescript: "#3178C6",
    javascript: "#F7DF1E",
    python: "#3776AB",
    bash: "#4EAA25",
    sh: "#4EAA25",
    protobuf: "#4285F4",
    yaml: "#CB171E",
    text: "#6B7280",
  };

  const color = colors[lang] || "#8cc5e7";

  return (
    <div
      className="language-icon-dot"
      style={{ backgroundColor: color }}
    />
  );
};

export default LanguageIcon;
