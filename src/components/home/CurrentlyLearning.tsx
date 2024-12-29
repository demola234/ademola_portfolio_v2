import { useState } from "react";
import IconContainerForLearning from "./currentlylearning/IconContainerForLearning";

const CurrentlyLearning = () => {
  const [hoveredTool, setHoveredTool] = useState<{
    name: string;
    color: string;
  }>({
    name: "Currently Learning",
    color: "#fff",
  });

  return (
    <div className="w-full flex flex-col mt-[70px]">
      {/* Animated Title Container */}
      <div className="relative h-[30px] overflow-hidden">
        {/* Tool Name Animation */}
        <h1
          className={`absolute w-full text-[20px] font-[600] transition-transform duration-500 ease-in-out ${
            hoveredTool.name === "Currently Learning"
              ? "translate-y-0"
              : "-translate-y-[40px]"
          }`}
        >
          Currently Learning
        </h1>
        <h1
          className={`absolute w-full text-[20px] font-[600] transition-transform duration-500 ease-in-out ${
            hoveredTool.name === "Currently Learning"
              ? "translate-y-[40px]"
              : "translate-y-0"
          }`}
          style={{ color: hoveredTool.color }}
        >
          {hoveredTool.name}
        </h1>
      </div>

      {/* Icon Container */}
      <IconContainerForLearning
        hoveredTool={hoveredTool}
        setHoveredTool={setHoveredTool}
      />
    </div>
  );
};

export default CurrentlyLearning;
