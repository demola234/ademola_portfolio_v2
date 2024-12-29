import { FC } from "react";

// Define the props for the Types component
interface TypeObject {
  type: string;
  background: boolean;
}

// Define props for ProjectTypeBar
interface ProjectTypeBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

// Array of project types with proper typing
const types: TypeObject[] = [
  { type: "projects", background: true },
  { type: "mobile", background: false },
  { type: "Backend", background: false },
  { type: "Dev Tools", background: false },
  { type: "Open Source", background: false },
  { type: "Design", background: false },
];

// The ProjectTypeBar component
const ProjectTypeBar: FC<ProjectTypeBarProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex gap-3 m-[0_auto] flex-wrap">
      {types.map((type, index) => (
        <div
          key={index}
          className={`flex items-center justify-center py-[6px] px-[14px] capitalize cursor-pointer ${
            type.type.toLowerCase() === selectedCategory.toLowerCase()
              ? "bg-white text-neutralMid"
              : "bg-neutralMid text-white"
          } rounded-[11px] text-sm font-medium`}
          onClick={() => onCategoryChange(type.type)}
        >
          {type.type}
        </div>
      ))}
    </div>
  );
};

export default ProjectTypeBar;
