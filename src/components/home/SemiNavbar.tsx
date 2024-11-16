import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const SemiNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className="w-full border border-[#3D3D3D]/50 px-4 py-3 mt-10 relative">
      <button
        className="text-primaryDefault focus:outline-none"
        onClick={toggleMenu}
      >
        {"> "}Menu
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
            to="/blog-posts"
            className="block py-2 text-white hover:text-primaryDefault"
          >
            ~blogs/
          </Link>
          <a
            href="#tools"
            className="block py-2 text-white hover:text-primaryDefault"
          >
            ~tools/
          </a>
          <a
            href="#projects"
            className="block py-2 text-white hover:text-primaryDefault"
          >
            ~projects/
          </a>
        </nav>
      </div>
    </div>
  );
};

export default SemiNavbar;
