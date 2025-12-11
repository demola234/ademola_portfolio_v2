import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import appstore_logo from "../assets/appstore_logo.png";
import playstore_logo from "../assets/palystore_logo.png";
import web_logo from "../assets/website.png";
import MarkdownViewer from "../components/blogs/MarkdownViewer";
import { projects } from "../data/project";
import Footer from "../layout/rootLayout/Footer";
import { umami } from "../utils/umami";

const ProjectPost = () => {
  const { title } = useParams<{ title: string }>();
  const [project, setProject] = useState<any>();

  useEffect(() => {
    const foundProject = projects.find((proj) => proj.project_name === title);
    setProject(foundProject);

    // Track project view with Umami
    if (foundProject) {
      umami.trackProjectView(foundProject.project_name, title || "");
    }
  }, [title]);

  return (
    <div className="md:px-[43px] flex flex-col gap-5">
      <div>
        {project ? (
          <div>
            <div className="flex gap-6">
              {project.play_store_link &&
                project.play_store_link.trim() !== "" && (
                  <a
                    className="font-medium  text-[0.676rem] flex items-center gap-2 cursor-pointer"
                    href={project.play_store_link}
                    onClick={() => umami.trackExternalLink(project.play_store_link, "Play Store")}
                  >
                    <img src={playstore_logo} alt="Playstore" />
                    <p> View on Playstore</p>{" "}
                  </a>
                )}
              {project.app_store_link && project.app_store_link.trim !== "" && (
                <a
                  className="font-medium text-[0.676rem] flex items-center gap-2 cursor-pointer"
                  href={project.app_store_link}
                  onClick={() => umami.trackExternalLink(project.app_store_link, "App Store")}
                >
                  <img src={appstore_logo} alt="Appstore" />
                  <p> View on Appstore</p>
                </a>
              )}
              {project.github_link && project.github_link.trim !== "" && (
                <a
                  className="font-medium text-[0.676rem] flex items-center gap-2 cursor-pointer"
                  href={project.github_link}
                  onClick={() => umami.trackExternalLink(project.github_link, "GitHub/Web")}
                >
                  <img src={web_logo} alt="Appstore" />
                  <p> View on web</p>
                </a>
              )}
            </div>
            <div className="flex flex-col gap-1 pt-8 heroshape">
              <h1 className="text-[1.69rem] font-semibold">
                {project.project_name}
              </h1>
              <p className="text-[10.418px] tracking-[0.208px] leadin-3 font-medium ">
                {project.project_name} - {project.short_description}
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <p className="text-xs font-semibold">Technologies used</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies_used &&
                    project.technologies_used.map((tech: string, i: number) => (
                      <div
                        className="text-xs font-medium p-[10px_24px] bg-[rgb(255,255,255,0.10)] rounded-[11px]"
                        key={i}
                      >
                        {tech}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center w-full mt-5 ">
              <img src={project.image_url} alt="" className="w-full h-full" />
            </div>
            {project.markdown_path ? (
              <MarkdownViewer filePath={project.markdown_path} />
            ) : (
              <p className="mt-5 text-center text-gray-700 text-lg">
                Content Coming Soon
              </p>
            )}
            {/* <div className="flex flex-col gap-3 pt-[59px] pb-[30px]">
              <h3 className="font-semibold capitalize text-[1.5rem]">about</h3>
              <p className="text-[1.1rem] fon-medium">
                DefiFundr is a decentralized crowdfunding platform built on the
                Ethereum blockchain. It allows users to create and contribute to
                crowdfunding campaigns, and allows campaign creators to set a
                funding goal and deadline. If the funding goal is met before the
                deadline, the campaign is successful and the funds are released
                to the campaign creator. If the funding goal is not met before
                the deadline, the campaign is unsuccessful and the funds are
                returned to the contributors.
              </p>
            </div> */}
            {/* <div>
              <h3 className="text-[18px] font-semibold">Prerequisites</h3>
              <ul className="pt-3 pl-5 ">
                <li className="list-disc text-[1.1rem] fon-semibold">
                  Flutter SDK
                </li>
                <li className="list-disc text-[1.1rem] fon-semibold">
                  Android Studio / Xcode
                </li>
                <li className="list-disc text-[1.1rem] fon-semibold">
                  Golang (for running the local blockchain)
                </li>
                <li className="list-disc text-[1.1rem] fon-semibold">
                  Ganache (for running the local blockchain)
                </li>
                <li className="list-disc text-[1.1rem] fon-semibold">
                  Metamask (for interacting with the blockchain)
                </li>
                <li className="list-disc text-[1.1rem] fon-semibold">
                  Solidity (for writing smart contracts)
                </li>
              </ul>
            </div> */}

            {/* <div className="flex flex-col gap-4 pt-8">
              <h3 className="text-[18px] font-semibold">Screenshots</h3>
              <div className="flex flex-wrap gap-3">
                <img src={active_donations} alt="" />
                <img src={active_donations} alt="" />
                <img src={active_donations} alt="" />
                <img src={active_donations} alt="" />
                <img src={active_donations} alt="" />
                <img src={active_donations} alt="" />
                <img src={active_donations} alt="" />
                <img src={active_donations} alt="" />
              </div>
            </div> */}
          </div>
        ) : (
          <p>Project not found</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProjectPost;
