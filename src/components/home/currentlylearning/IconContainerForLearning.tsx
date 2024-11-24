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

interface IconContainerProps {
  hoveredTool: HoveredTool;
  setHoveredTool: React.Dispatch<React.SetStateAction<HoveredTool>>;
}

const IconContainerForLearning: React.FC<IconContainerProps> = ({
  hoveredTool,
  setHoveredTool,
}) => {
  // Define tool colors
  const toolColors: { [key: string]: string } = {
    Kotlin: "#41D0FD",
    Rust: "#DEA584",
    NextJs: "#0070F3",
    Kubernetes: "#326CE5",
    Python: "#FFE873",
    Jetpack: "#2E7D32",
  };

  const handleMouseEnter = (toolName: string) => {
    setHoveredTool({ name: toolName, color: toolColors[toolName] || "#fff" });
  };

  const handleMouseLeave = () => {
    setHoveredTool({ name: "Currently Learning", color: "#fff" });
  };

  return (
    <div className="w-full mt-[19px] bg-[#1E1E1E]/30 grid grid-cols-6 border border-[#3D3D3D]/50 relative">
      <div className="absolute -right-[8px] -top-[8px]">
        <PlusIcon />
      </div>
      <div className="absolute -left-[8px] -bottom-[8px]">
        <PlusIcon />
      </div>
      {Object.keys(toolColors).map((tool) => (
        <div
          key={tool}
          className="flex justify-center border cursor-pointer py-[10px] lg:py-[66px] px-[18px] border-[#3D3D3D]/50 items-center"
          onMouseEnter={() => handleMouseEnter(tool)}
          onMouseLeave={handleMouseLeave}
        >
          {tool === "Kotlin" && (
            <KotlinIcon isHovered={hoveredTool.name === tool} />
          )}
          {tool === "Rust" && (
            <RustIcon isHovered={hoveredTool.name === tool} />
          )}
          {tool === "NextJs" && (
            <NextJsIcon isHovered={hoveredTool.name === tool} />
          )}
          {tool === "Kubernetes" && (
            <KubernetesIcon isHovered={hoveredTool.name === tool} />
          )}
          {tool === "Python" && (
            <PythonIcon isHovered={hoveredTool.name === tool} />
          )}
          {tool === "Jetpack" && (
            <JetpackIcon isHovered={hoveredTool.name === tool} />
          )}
        </div>
      ))}
    </div>
  );
};

export default IconContainerForLearning;
