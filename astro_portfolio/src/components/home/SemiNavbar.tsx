import { useEffect, useRef, useState } from "react";


const SemiNavbar = ({ currentPage }: { currentPage: string }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<String>();
  const location = { pathname: currentPage };
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
          <a
            href="/"
            className={`block py-2 text-white hover:text-primaryDefault ${
              location.pathname === "/" && "text-primaryDefault"
            }`}
          >
            ~home/
          </a>
          <a
            href="/blogs"
            className={`block py-2 text-white hover:text-primaryDefault ${
              location.pathname === "/blogs" && "text-primaryDefault"
            }`}
          >
            ~blogs/
          </a>
          <a
            href="/projects"
            className={`block py-2 text-white hover:text-primaryDefault ${
              location.pathname === "/projects" && "text-primaryDefault"
            }`}
          >
            ~projects/
          </a>
        </nav>
      </div>
    </div>
  );
};

export default SemiNavbar;
