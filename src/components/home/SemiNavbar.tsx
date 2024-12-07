import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SemiNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<String>();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (containerRef.current) {
      if (isMenuOpen) {
        containerRef.current.style.maxHeight = `${containerRef.current.scrollHeight}px`;
      } else {
        containerRef.current.style.maxHeight = "0";
      }
    }
  }, [isMenuOpen]);
  useEffect(() => {
    setCurrentLocation(location.pathname);
  }, [location.pathname]);

  return (
    <div className="w-full border border-[#3D3D3D]/50 px-4 py-3 mt-10 relative">
      <button
        className="text-primaryDefault focus:outline-none"
        onClick={toggleMenu}
      >
        {"> "}
        {currentLocation === "/" ? "home" : currentLocation?.slice(1)}
      </button>
      <div
        ref={containerRef}
        className={`overflow-hidden transition-max-height duration-500 ease-in-out ${
          !isMenuOpen && "invisible"
        }`}
        style={{ maxHeight: "0" }}
      >
        <nav>
          <Link
            to="/"
            className="block py-2 text-white hover:text-primaryDefault"
          >
            ~home/
          </Link>
          <Link
            to="/blogs"
            className="block py-2 text-white hover:text-primaryDefault"
          >
            ~blogs/
          </Link>
          {/* <a
            href="#tools"
            className="block py-2 text-white hover:text-primaryDefault"
          >
            ~tools/
          </a> */}
          <Link
            to="/projects"
            className="block py-2 text-white hover:text-primaryDefault"
          >
            ~projects/
          </Link>
          <Link
            to="/about"
            className="block py-2 text-white hover:text-primaryDefault"
          >
            ~about/
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default SemiNavbar;
