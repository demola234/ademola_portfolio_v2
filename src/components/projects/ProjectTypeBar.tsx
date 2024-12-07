import { FC } from "react";

// Define the type for each project type object
interface TypeObject {
  type: string;
  background: boolean;
}

// Array of project types with proper typing
const types: TypeObject[] = [
  {
    type: "projects",
    background: true,
  },
  {
    type: "mobile",
    background: false,
  },
  {
    type: "Backend",
    background: false,
  },
  {
    type: "Dev Tools",
    background: false,
  },
  {
    type: "Open Source",
    background: false,
  },
  {
    type: "Design",
    background: false,
  },
];

// Define the props for the Types component
interface TypesProps {
  projectType: string;
  background: boolean;
}

// The Types component
const Types: FC<TypesProps> = ({ projectType, background }) => {
  return (
    <div
      className={`flex items-center justify-center py-[6px] px-[14px] capitalize ${
        background ? "bg-white text-neutralMid" : "bg-neutralMid text-white"
      } rounded-[11px] text-sm font-medium`}
    >
      {projectType}
    </div>
  );
};

// The ProjectTypeBar component
const ProjectTypeBar: FC = () => {
  return (
    <div className="flex gap-3 m-[0_auto] flex-wrap">
      {types.map((type, index) => (
        <Types
          key={index}
          projectType={type.type}
          background={type.background}
        />
      ))}
    </div>
  );
};

export default ProjectTypeBar;
