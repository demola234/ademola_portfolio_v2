import { FC } from "react";

interface ProjectCardProps {
  title: string;
  short_description: string;
  image_url: string;
}

const ProjectCard: FC<ProjectCardProps> = ({
  title,
  short_description,
  image_url,
}) => {
  return (
    <div className="project-container group cursor-pointer border border-[#707070] p-6 relative overflow-hidden">
      {/* Wrapper for image with increased aspect ratio */}
      <div className="relative w-full h-0 pb-[60%] overflow-hidden">
        <img
          src={image_url}
          alt="Project Thumbnail"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-125"
        />
      </div>
      {/* Information overlay */}
      <div className="project-information absolute bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.7)] p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h5 className="text-white text-[18px] font-bold">{title}</h5>
        <p className="text-white text-[16px]">{short_description}</p>
      </div>
    </div>
  );
};

export default ProjectCard;
