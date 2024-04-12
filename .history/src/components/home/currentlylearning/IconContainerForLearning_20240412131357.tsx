import { useState } from "react";
import {
  JetpackIcon,
  KotlinIcon,
  KubernetesIcon,
  NextJsIcon,
  PlusIcon,
  PythonIcon,
  RustIcon,
} from "../../../assets/svg";
interface HoveredTool {
  name: string;
  color: string;
}
const IconContainerForLearning = () => {
  const [hoveredTool, setHoveredTool] = useState<HoveredTool>({
    name: "Tools",
    color: "#fff",
  });
  //color of texts
  const toolColors: { [key: string]: string } = {
    Kotlin: "#41D0FD",
  };
  const handleMouseEnter = (toolName: string) => {
    setHoveredTool({ name: toolName, color: toolColors[toolName] });
  };

  const handleMouseLeave = () => {
    setHoveredTool({ name: "Tools", color: "#fff" });
  };

  return (
    <div className="w-full mt-[19px] bg-[#1E1E1E]/30 grid-cols-6  grid  border border-[#3D3D3D]/50 relative">
      <div className="absolute -right-[8px] -top-[8px]">
        <PlusIcon />
      </div>
      <div className="absolute -left-[8px] -bottom-[8px]">
        <PlusIcon />
      </div>
      <div
        className="flex justify-center border py-[10px] lg:py-[66px] px-[18px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Kotlin")}
        onMouseLeave={handleMouseLeave}
      >
        <KotlinIcon isHovered={hoveredTool.name === "Kotlin"} />
      </div>
      <div
        className="flex justify-center border py-[10px] lg:py-[66px] px-[18px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Rust")}
        onMouseLeave={handleMouseLeave}
      >
        <RustIcon isHovered={hoveredTool.name === "Rust"} />
      </div>
      <div
        className="flex justify-center border py-[10px] lg:py-[66px] px-[18px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("NextJs")}
        onMouseLeave={handleMouseLeave}
      >
        <NextJsIcon isHovered={hoveredTool.name === "NextJs"} />
      </div>
      <div
        className="flex justify-center border py-[10px] lg:py-[66px] px-[18px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Kubernetes")}
        onMouseLeave={handleMouseLeave}
      >
        <KubernetesIcon isHovered={hoveredTool.name === "Kubernetes"} />
      </div>
      <div
        className="flex justify-center border py-[10px] lg:py-[66px] px-[18px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Python")}
        onMouseLeave={handleMouseLeave}
      >
        <PythonIcon isHovered={hoveredTool.name === "Python"} />
      </div>
      <div
        className="flex justify-center border py-[10px] lg:py-[66px] px-[18px] border-[#3D3D3D]/50 items-center"
        onMouseEnter={() => handleMouseEnter("Jetpack")}
        onMouseLeave={handleMouseLeave}
      >
        <JetpackIcon isHovered={hoveredTool.name === "Kotlin"} />
      </div>
    </div>
  );
};

export default IconContainerForLearning;
