import { useEffect, useState } from "react";
import slugify from "slugify";
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
        <a href="/projects"
          className="text-[#7AFBFF] text-sm font-medium capitalize"
        >
          View More
        </a>
      </div>
      <div className="w-full grid lg:grid-cols-3 mt-[31px] gap-[15px]">
        {selectedProject.map((project, i) => (
          <a key={i} href={`/projects/${slugify(project.project_name, { lower: true, strict: true })}`}>
            <ProjectCard
              key={i}
              title={project.project_name}
              image_url={project.image_url}
              short_description={project.short_description}
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default Projects;
