import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projects } from "../../data/project";
import ProjectCard from "../projects/ProjectCard";

const Projects = () => {
  const [selectedProject] = useState(() => projects.slice(0, 6));
  useEffect(() => {
    console.log(selectedProject);
  }, []);

  return (
    <div className="w-full flex flex-col mt-[63px] ">
      <div className="flex items-center gap-3 ">
        <h1 className="text-[20px] font-[600]">Selected Projects</h1>
        <Link
          to="/projects"
          className="text-[#7AFBFF] text-sm font-medium capitalize"
        >
          View More
        </Link>
      </div>
      <div className="w-full grid lg:grid-cols-3 mt-[31px] gap-[15px]">
        {selectedProject.map((project, i) => (
          <Link key={i} to={`/projects/${project.project_name}`}>
            <ProjectCard
              key={i}
              title={project.project_name}
              image_url={project.image_url}
              short_description={project.short_description}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Projects;
