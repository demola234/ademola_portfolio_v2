import { useEffect, useState } from "react";
import { Github, LinkedIn, Medium, Resume, XTwitter } from "../../assets/svg";

const Navbar = ({ currentPage }: { currentPage: string }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = { pathname: currentPage };

  // Check if we're on home page
  const isHomePage = location.pathname === "/";
  // Check if we're on a blog post page
  const isBlogPostPage = location.pathname.startsWith("/blogs/") && location.pathname !== "/blogs";
  // Check if we're on a project post page
  const isProjectPostPage = location.pathname.startsWith("/projects/") && location.pathname !== "/projects";

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 100;
          setIsScrolled(scrolled);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="navbar-sticky">
      <div className="navbar-content">
        <div className="nav-links-row">
          {/* Back to Blogs - Only on Blog Post Pages */}
          {isBlogPostPage && (
            <a
              href="/blogs"
              className="flex gap-x-[12px] items-center px-[19px] py-[10px] rounded-full transition-colors duration-300 bg-white/5 hover:bg-white/10 text-gray-400"
            >
              <span>&lt;</span>
              <p className="text-[12px] font-medium">Back to Blogs</p>
            </a>
          )}

          {/* Back to Projects - Only on Project Post Pages */}
          {isProjectPostPage && (
            <a
              href="/projects"
              className="flex gap-x-[12px] items-center px-[19px] py-[10px] rounded-full transition-colors duration-300 bg-white/5 hover:bg-white/10 text-gray-400"
            >
              <span>&lt;</span>
              <p className="text-[12px] font-medium">Back to Projects</p>
            </a>
          )}

          {/* Page Navigation - Hidden on Blog/Project Post Pages */}
          {!isBlogPostPage && !isProjectPostPage && (
            <>
              <a
                href="/"
                className={`flex gap-x-[12px] items-center px-[19px] py-[10px] rounded-full transition-colors duration-300 ${
                  location.pathname === "/" ? "bg-white/10 text-white" : "bg-white/5 hover:bg-white/10 text-gray-400"
                }`}
              >
                <p className="text-[12px] font-medium">Home</p>
              </a>
              <a
                href="/projects"
                className={`flex gap-x-[12px] items-center px-[19px] py-[10px] rounded-full transition-colors duration-300 ${
                  location.pathname.startsWith("/projects") ? "bg-white/10 text-white" : "bg-white/5 hover:bg-white/10 text-gray-400"
                }`}
              >
                <p className="text-[12px] font-medium">Projects</p>
              </a>
              <a
                href="/blogs"
                className={`flex gap-x-[12px] items-center px-[19px] py-[10px] rounded-full transition-colors duration-300 ${
                  location.pathname.startsWith("/blogs") ? "bg-white/10 text-white" : "bg-white/5 hover:bg-white/10 text-gray-400"
                }`}
              >
                <p className="text-[12px] font-medium">Blogs</p>
              </a>
            </>
          )}

          {/* Divider - Desktop Only, Only Show on Home Page */}
          {isHomePage && !isScrolled && (
            <div className="h-[24px] w-[1px] bg-white/10 mx-[4px] hidden md:block"></div>
          )}
        </div>

        {/* Social Links - Only on Home Page, Hidden on Scroll */}
        {isHomePage && (
          <div className={`social-links-row ${isScrolled ? "social-hidden" : ""}`}>

          {/* Social Links */}
          <a
            href="https://github.com/demola234"
            target="_blank"
            className="flex gap-x-[12px] items-center px-[19px] py-[10px] bg-white/5 hover:bg-black rounded-full transition-colors duration-300"
          >
            <Github />
            <p className="text-[12px]">Github</p>
          </a>
          <a
            target="_blank"
            href="https://docs.google.com/document/d/1_f1ufm9wkCCEWFMyIKFfso7bRFG-mB3YnMMTPIogMkw/edit#heading=h.4prkjmzco10w"
            className="flex gap-x-[12px] items-center px-[19px] py-[10px] bg-white/5 hover:bg-black rounded-full transition-colors duration-300"
          >
            <Resume />
            <p className="text-[12px]">Resume</p>
          </a>
          <a
            target="_blank"
            href="https://twitter.com/ademolaDi"
            className="flex items-center px-[11px] py-[12px] bg-white/5 hover:bg-black rounded-full rounded-lg transition-colors duration-300"
          >
            <XTwitter />
          </a>
          <a
            target="_blank"
            href="https://www.linkedin.com/in/ademoladev/"
            className="flex items-center px-[11px] py-[12px] bg-white/5 hover:bg-black rounded-full rounded-lg transition-colors duration-300"
          >
            <LinkedIn />
          </a>
          <a
            target="_blank"
            href="https://medium.com/@ademolakolawole"
            className="flex items-center px-[11px] py-[12px] bg-white/5 hover:bg-black rounded-full rounded-lg transition-colors duration-300"
          >
            <Medium />
          </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
