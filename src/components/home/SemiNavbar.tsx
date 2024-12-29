import { useEffect, useRef, useState } from "react";
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
        className="text-primaryDefault focus:outline-none capitalize"
        onClick={toggleMenu}
      >
        {"> "}
        {currentLocation === "/" ? "Home" : currentLocation?.slice(1)}
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
            className={`block py-2 text-white hover:text-primaryDefault ${
              currentLocation === "/" && "text-primaryDefault"
            }`}
          >
            ~home/
          </Link>
          <Link
            to="/blogs"
            className={`block py-2 text-white hover:text-primaryDefault ${
              currentLocation === "/blogs" && "text-primaryDefault"
            }`}
          >
            ~blogs/
          </Link>
          <Link
            to="/projects"
            className={`block py-2 text-white hover:text-primaryDefault ${
              currentLocation === "/projects" && "text-primaryDefault"
            }`}
          >
            ~projects/
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default SemiNavbar;
