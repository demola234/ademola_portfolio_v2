import { Github, LinkedIn, Medium, Resume, XTwitter } from "../../assets/svg";

const Navbar = () => {
  const handleLinkClick = (targetId: string) => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="w-full h-[96px] flex items-center gap-x-[7px]">
      <div className="flex gap-x-[12px] items-center px-[19px] py-[10px]">
        <Github />
        <p className="text-[12px]">Github</p>
      </div>
      <div className="flex gap-x-[12px] items-center px-[19px] py-[10px]">
        <Resume />
        <p className="text-[12px]">Resume</p>
      </div>

      <XTwitter />

      <div className="flex  items-center px-[11px] py-[12px]">
        <LinkedIn />
      </div>
      <div className="flex  items-center px-[11px] py-[12px]">
        <Medium />
      </div>
    </div>
  );
};

export default Navbar;
