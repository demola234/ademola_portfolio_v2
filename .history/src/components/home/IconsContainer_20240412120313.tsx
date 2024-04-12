import React, { useState } from "react";
import {
  DartIcon,
  DockerIcon,
  FlutterIcon,
  GitIcon,
  GoIcon,
  MongoIcon,
  PlusIcon,
  PostgresIcon,
  SolidityIcon,
  SwiftIcon,
  TypescriptIcon,
} from "../../assets/svg";

// Define interfaces for the icon props

// Define the interface for the hovered tool state
interface HoveredTool {
  name: string;
  color: string;
}

export const IconsContainer: React.FC = () => {
  const [hoveredTool, setHoveredTool] = useState<HoveredTool>({
    name: "Tools",
    color: "#fff",
  });
  //color of texts
  const toolColors: { [key: string]: string } = {
    Flutter: "#41D0FD",
    GitHub: "#181717",
    Golang: "#69d7e2",
    Swift: "#F05138",
    Dart: "#0081C6",
    Postgres: "#336791",
    Git: "#EE513B",
    Docker: "#1794D4",
    
    TypeScript: "#3178c6",
    Next: "#000000",
  };

  const handleMouseEnter = (toolName: string) => {
    setHoveredTool({ name: toolName, color: toolColors[toolName] });
  };

  const handleMouseLeave = () => {
    setHoveredTool({ name: "Tools", color: "#fff" });
  };

  return (
    <div className="w-full bg-[#1E1E1E]/30 grid-cols-6  grid  border border-[#3D3D3D]/50 relative">
      <div className="absolute -right-[8px] -top-[8px]">
        <PlusIcon />
      </div>
      <div className="absolute -left-[8px] -bottom-[8px]">
        <PlusIcon />
      </div>
      <div className="lg:col-span-2  border flex items-center border-[#3D3D3D]/50 py-[26px] pl-[21px] pr-[40px]">
        <h2 className="text-[20px] font-[600]">
          Building cool stuff with{" "}
          <span style={{ color: hoveredTool.color }}>{hoveredTool.name}</span>
        </h2>
      </div>

      <div
        className="flex h-full border cursor-pointer border-[#3D3D3D]/50 justify-center items-center"
        onMouseEnter={() => handleMouseEnter("Flutter")}
        onMouseLeave={handleMouseLeave}
      >
        <FlutterIcon isHovered={hoveredTool.name === "Flutter"} />
      </div>
      <div
        className="flex justify-center border py-[66px] px-[21px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Golang")}
        onMouseLeave={handleMouseLeave}
      >
        <GoIcon isHovered={hoveredTool.name === "Golang"} />
      </div>
      <div
        className="flex justify-center border py-[26px] px-[21px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Swift")}
        onMouseLeave={handleMouseLeave}
      >
        <SwiftIcon isHovered={hoveredTool.name === "Swift"} />
      </div>

      <div
        className="flex justify-center border py-[26px] px-[21px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Dart")}
        onMouseLeave={handleMouseLeave}
      >
        <DartIcon isHovered={hoveredTool.name === "Dart"} />
      </div>

      <div
        className="flex justify-center border py-[26] px-[21px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Postgres")}
        onMouseLeave={handleMouseLeave}
      >
        <PostgresIcon isHovered={hoveredTool.name === "Postgres"} />
      </div>

      <div
        className="flex justify-center border py-[66px] px-[21px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("TypeScript")}
        onMouseLeave={handleMouseLeave}
      >
        <TypescriptIcon isHovered={hoveredTool.name === "TypeScript"} />
      </div>
      <div
        className="flex justify-center border py-[26px] px-[21px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Git")}
        onMouseLeave={handleMouseLeave}
      >
        <GitIcon isHovered={hoveredTool.name === "Git"} />
      </div>

      <div
        className="flex justify-center border py-[26] px-[21px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Docker")}
        onMouseLeave={handleMouseLeave}
      >
        <DockerIcon isHovered={hoveredTool.name === "Docker"} />
      </div>
      <div
        className="flex justify-center border py-[26] px-[21px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Mongo")}
        onMouseLeave={handleMouseLeave}
      >
        <MongoIcon isHovered={hoveredTool.name === "Mongo"} />
      </div>

      <div
        className="flex justify-center border py-[26] px-[21px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Solidity")}
        onMouseLeave={handleMouseLeave}
      >
        <SolidityIcon isHovered={hoveredTool.name === "Solidity"} />
      </div>
      {/* <div
          className="icon-item"
          onMouseEnter={() => handleMouseEnter("GitHub")}
          onMouseLeave={handleMouseLeave}
        >
          <GitHubIcon isHovered={hoveredTool.name === "GitHub"} />
        </div> */}
      {/* <div
          className="icon-item"
          onMouseEnter={() => handleMouseEnter("Plus")}
          onMouseLeave={handleMouseLeave}
        >
          <PlusIcon isHovered={hoveredTool.name === "Plus"} />
        </div> */}
      {/* <div
          className="icon-item"
          onMouseEnter={() => handleMouseEnter("Next.js")}
          onMouseLeave={handleMouseLeave}
        >
          <NextJsIcon isHovered={hoveredTool.name === "Next.js"} />
        </div> */}
    </div>
  );
};
