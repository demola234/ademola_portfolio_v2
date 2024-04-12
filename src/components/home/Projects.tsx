const Projects = () => {
  return (
    <div className="w-full flex flex-col mt-[63px]">
      <div>
        <h1 className="text-[20px] font-[600]">Projects</h1>
        <p className="text-[#D3D3D3] text-[13px] mt-[14px] w-[85%]">
          During my free time, I like to build things that I find interesting
          and/or would use; sometimes to learn more about something or just to
          fix a problem that's particularly frustrated me enough at that point
          in time. Here are a couple of them, you can find other random things I
          build on my GitHub profile.
        </p>
      </div>
      <div className="w-full grid lg:grid-cols-3 mt-[31px] gap-[15px]">
        <div className="project-container group cursor-pointer border border-[#707070] p-[20px] relative overflow-hidden">
          <img
            src="https://via.placeholder.com/400"
            alt="Project Thumbnail"
            className="w-full h-auto transition-transform duration-300 group-hover:scale-110"
          />
          <div className="project-information absolute bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.7)] p-[20px] translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h5 className="text-white text-[16px] font-bold">Project Title</h5>
            <p className="text-white text-[14px]">
              Brief description of what this project is about.
            </p>
          </div>
        </div>
        <div className="project-container group cursor-pointer border border-[#707070] p-[20px] relative overflow-hidden">
          <img
            src="https://via.placeholder.com/400"
            alt="Project Thumbnail"
            className="w-full h-auto transition-transform duration-300 group-hover:scale-110"
          />
          <div className="project-information absolute bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.7)] p-[20px] translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h5 className="text-white text-[16px] font-bold">Project Title</h5>
            <p className="text-white text-[14px]">
              Brief description of what this project is about.
            </p>
          </div>
        </div>
        <div className="project-container group cursor-pointer border border-[#707070] p-[20px] relative overflow-hidden">
          <img
            src="https://via.placeholder.com/400"
            alt="Project Thumbnail"
            className="w-full h-auto transition-transform duration-300 group-hover:scale-110"
          />
          <div className="project-information absolute bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.7)] p-[20px] translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h5 className="text-white text-[16px] font-bold">Project Title</h5>
            <p className="text-white text-[14px]">
              Brief description of what this project is about.
            </p>
          </div>
        </div>
        <div className="project-container group cursor-pointer border border-[#707070] p-[20px] relative overflow-hidden">
          <img
            src="https://via.placeholder.com/400"
            alt="Project Thumbnail"
            className="w-full h-auto transition-transform duration-300 group-hover:scale-110"
          />
          <div className="project-information absolute bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.7)] p-[20px] translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h5 className="text-white text-[16px] font-bold">Project Title</h5>
            <p className="text-white text-[14px]">
              Brief description of what this project is about.
            </p>
          </div>
        </div>
        <div className="project-container group cursor-pointer border border-[#707070] p-[20px] relative overflow-hidden">
          <img
            src="https://via.placeholder.com/400"
            alt="Project Thumbnail"
            className="w-full h-auto transition-transform duration-300 group-hover:scale-110"
          />
          <div className="project-information absolute bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.7)] p-[20px] translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h5 className="text-white text-[16px] font-bold">Project Title</h5>
            <p className="text-white text-[14px]">
              Brief description of what this project is about.
            </p>
          </div>
        </div>
        <div className="project-container group cursor-pointer border border-[#707070] p-[20px] relative overflow-hidden">
          <img
            src="https://via.placeholder.com/400"
            alt="Project Thumbnail"
            className="w-full h-auto transition-transform duration-300 group-hover:scale-110"
          />
          <div className="project-information absolute bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.7)] p-[20px] translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h5 className="text-white text-[16px] font-bold">Project Title</h5>
            <p className="text-white text-[14px]">
              Brief description of what this project is about.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
