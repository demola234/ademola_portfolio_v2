import { FC } from "react";

interface ProjectCardProps {
  title: string;
  short_description: string;
  image_url: string;
}

const ProjectCard: FC<ProjectCardProps> = ({
  title,
  short_description,
  // image_url,
}) => {
  return (
    <div className="project-container group cursor-pointer border border-[#707070] p-[20px] relative overflow-hidden">
      <img
        src="https://via.placeholder.com/400"
        alt="Project Thumbnail"
        className="w-full h-auto transition-transform duration-300 group-hover:scale-110"
      />
      <div className="project-information absolute bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.7)] p-[20px] translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h5 className="text-white text-[16px] font-bold">{title}</h5>
        <p className="text-white text-[14px]">{short_description}</p>
      </div>
    </div>
  );
};

export default ProjectCard;
