import { useState } from "react";
import slugify from "slugify";
import ProjectCard from "./ProjectCard";
import ProjectTypeBar from "./ProjectTypeBar";
import { projects } from "../../data/project";

const ProjectsView = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("projects");

  // Filter projects based on selected category
  const filteredProjects =
    selectedCategory === "projects"
      ? projects
      : projects.filter((project) =>
          project.category
            .toLowerCase()
            .split(", ")
            .includes(selectedCategory.toLowerCase())
        );

  return (
    <div>
      <div className="flex flex-col gap-4">
        <h1 className="px-3 font-semibold text-xl/8">Projects</h1>
        <ProjectTypeBar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <div className="grid gap-6 mt-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:px-3">
          {filteredProjects.map((project, i) => (
            <a key={i} href={`/projects/${slugify(project.project_name, { lower: true, strict: true })}`}>
              <ProjectCard
                title={project.project_name}
                image_url={project.image_url}
                short_description={project.short_description}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsView;
