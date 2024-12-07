import { Link } from "react-router-dom";
import SemiNavbar from "../components/home/SemiNavbar";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectTypeBar from "../components/projects/ProjectTypeBar";
import { projects } from "../data/project";

const Projects = () => {
  return (
    <div>
      <div className="flex flex-col gap-4">
        <SemiNavbar />
        <h1 className="px-3 font-semibold text-xl/8">Projects</h1>
        <ProjectTypeBar />
        <div className="grid gap-6 mt-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:px-3">
          {projects.map((project, i) => (
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
    </div>
  );
};

export default Projects;
