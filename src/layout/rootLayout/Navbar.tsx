import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Github, LinkedIn, Medium, Resume, XTwitter } from "../../assets/svg";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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
            <NavLink
              to="/blogs"
              className="flex gap-x-[12px] items-center px-[19px] py-[10px] rounded-full transition-colors duration-300 bg-white/5 hover:bg-white/10 text-gray-400"
            >
              <span>&lt;</span>
              <p className="text-[12px] font-medium">Back to Blogs</p>
            </NavLink>
          )}

          {/* Back to Projects - Only on Project Post Pages */}
          {isProjectPostPage && (
            <NavLink
              to="/projects"
              className="flex gap-x-[12px] items-center px-[19px] py-[10px] rounded-full transition-colors duration-300 bg-white/5 hover:bg-white/10 text-gray-400"
            >
              <span>&lt;</span>
              <p className="text-[12px] font-medium">Back to Projects</p>
            </NavLink>
          )}

          {/* Page Navigation - Hidden on Blog/Project Post Pages */}
          {!isBlogPostPage && !isProjectPostPage && (
            <>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex gap-x-[12px] items-center px-[19px] py-[10px] rounded-full transition-colors duration-300 ${
                    isActive ? "bg-white/10 text-white" : "bg-white/5 hover:bg-white/10 text-gray-400"
                  }`
                }
              >
                <p className="text-[12px] font-medium">Home</p>
              </NavLink>
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `flex gap-x-[12px] items-center px-[19px] py-[10px] rounded-full transition-colors duration-300 ${
                    isActive ? "bg-white/10 text-white" : "bg-white/5 hover:bg-white/10 text-gray-400"
                  }`
                }
              >
                <p className="text-[12px] font-medium">Projects</p>
              </NavLink>
              <NavLink
                to="/blogs"
                className={({ isActive }) =>
                  `flex gap-x-[12px] items-center px-[19px] py-[10px] rounded-full transition-colors duration-300 ${
                    isActive ? "bg-white/10 text-white" : "bg-white/5 hover:bg-white/10 text-gray-400"
                  }`
                }
              >
                <p className="text-[12px] font-medium">Blogs</p>
              </NavLink>
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
