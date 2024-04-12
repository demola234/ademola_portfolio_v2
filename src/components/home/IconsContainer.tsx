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
    Go: "",
    Next: "#000000",
  };

  const handleMouseEnter = (toolName: string) => {
    setHoveredTool({ name: toolName, color: toolColors[toolName] });
  };

  const handleMouseLeave = () => {
    setHoveredTool({ name: "Tools", color: "#fff" });
  };

  return (
    <div className="w-full bg-[#1E1E1E]/30 lg:grid-cols-6  grid-cols-5 grid  border border-[#3D3D3D]/50 relative">
      <div className="absolute -right-[8px] -top-[8px]">
        <PlusIcon />
      </div>
      <div className="absolute -left-[8px] -bottom-[8px]">
        <PlusIcon />
      </div>
      <div className="lg:col-span-2 col-span-5 border flex items-center border-[#3D3D3D]/50 py-[26px] pl-[21px] pr-[40px]">
        <h2 className="text-[20px] font-[600]">
          Building cool stuff with{" "}
          <span style={{ color: hoveredTool.color }}>{hoveredTool.name}</span>
        </h2>
      </div>

      <div
        className="flex h-full border cursor-pointer border-[#3D3D3D]/50 lg:py-[66px] px-[21px] justify-center items-center"
        onMouseEnter={() => handleMouseEnter("Flutter")}
        onMouseLeave={handleMouseLeave}
      >
        <FlutterIcon isHovered={hoveredTool.name === "Flutter"} />
      </div>
      <div className="flex justify-center border py-[20px] lg:py-[66px] px-[21px] border-[#3D3D3D]/50 items-center">
        <GoIcon />
      </div>
      <div className="flex justify-center border py-[20px] lg:py-[66px] px-[21px] border-[#3D3D3D]/50 items-center">
        <SwiftIcon />
      </div>
      <div className="flex justify-center border py-[20px] lg:py-[66px] px-[21px] border-[#3D3D3D]/50 items-center">
        <DartIcon />
      </div>
      <div className="flex justify-center border py-[20px] lg:py-[66px] px-[21px] border-[#3D3D3D]/50 items-center">
        <PostgresIcon />
      </div>
      <div className="flex justify-center border py-[20px] lg:py-[66px] px-[21px] border-[#3D3D3D]/50 items-center">
        <TypescriptIcon />
      </div>
      <div className="flex justify-center border py-[20px] lg:py-[66px] px-[21px] border-[#3D3D3D]/50 items-center">
        <GitIcon />
      </div>
      <div className="flex justify-center border py-[20px] lg:py-[66px] px-[21px] border-[#3D3D3D]/50 items-center">
        <DockerIcon />
      </div>
      <div className="flex justify-center border py-[20px] lg:py-[66px] px-[21px] border-[#3D3D3D]/50 items-center">
        <MongoIcon />
      </div>
      <div className="flex justify-center border py-[20px] lg:py-[66px] px-[21px] border-[#3D3D3D]/50 items-center">
        <SolidityIcon />
      </div>
    </div>
  );
};
