import { Github, LinkedIn, Medium, Resume, XTwitter } from "../../assets/svg";

const Navbar = () => {
  // const handleLinkClick = (targetId: string) => {
  //   const targetElement = document.getElementById(targetId);
  //   if (targetElement) {
  //     targetElement.scrollIntoView({ behavior: "smooth" });
  //   }
  // };
  return (
    <div className="w-full h-[96px] flex items-center gap-x-[7px]">
      <a
        href="https://github.com/demola234"
        target="_blank"
        className="flex gap-x-[12px] items-center px-[19px] py-[10px]"
      >
        <Github />
        <p className="text-[12px]">Github</p>
      </a>
      <a
        target="_blank"
        href="https://docs.google.com/document/d/1_f1ufm9wkCCEWFMyIKFfso7bRFG-mB3YnMMTPIogMkw/edit#heading=h.4prkjmzco10w"
        className="flex gap-x-[12px] items-center px-[19px] py-[10px]"
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
        className="flex  items-center px-[11px] py-[12px]"
      >
        <LinkedIn />
      </a>
      <a
        target="_blank"
        href="https://medium.com/@ademolakolawole"
        className="flex  items-center px-[11px] py-[12px]"
      >
        <Medium />
      </a>
    </div>
  );
};

export default Navbar;
