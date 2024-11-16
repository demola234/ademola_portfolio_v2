import { Github, LinkedIn, Medium, Resume, XTwitter } from "../../assets/svg";

const Navbar = () => {
  // const handleLinkClick = (targetId: string) => {
  //   const targetElement = document.getElementById(targetId);
  //   if (targetElement) {
  //     targetElement.scrollIntoView({ behavior: "smooth" });
  //   }
  // };
  return (
    <div className="w-full py-5 md:py-0 md:h-[96px] flex flex-wrap items-center gap-[7px] ">
      <a
        href="https://github.com/demola234"
        target="_blank"
        className="flex gap-x-[12px] items-center px-[19px] py-[10px] bg-white/5 rounded-full"
      >
        <Github />
        <p className="text-[12px]">Github</p>
      </a>
      <a
        target="_blank"
        href="https://docs.google.com/document/d/1_f1ufm9wkCCEWFMyIKFfso7bRFG-mB3YnMMTPIogMkw/edit#heading=h.4prkjmzco10w"
        className="flex gap-x-[12px] items-center px-[19px] py-[10px] bg-white/5 rounded-full"
      >
        <Resume />
        <p className="text-[12px]">Resume</p>
      </a>
      <a target="_blank" href="https://twitter.com/ademolaDi">
        <XTwitter />
      </a>

      <a
        target="_blank"
        href="https://www.linkedin.com/in/ademoladev/"
        className="flex bg-white/5 rounded-lg   items-center px-[11px] py-[12px]"
      >
        <LinkedIn />
      </a>
      <a
        target="_blank"
        href="https://medium.com/@ademolakolawole"
        className="flex  bg-white/5  rounded-lg items-center px-[11px] py-[12px]"
      >
        <Medium />
      </a>
    </div>
  );
};

export default Navbar;
