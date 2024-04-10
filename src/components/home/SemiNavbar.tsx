import { useState, useRef, useEffect } from "react";

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
          <a
            href="/home"
            className="block text-white hover:text-primaryDefault py-2"
          >
            ~home/
          </a>
          <a
            href="/blogs"
            className="block text-white hover:text-primaryDefault py-2"
          >
            ~blogs/
          </a>
          <a
            href="/tools"
            className="block text-white hover:text-primaryDefault py-2"
          >
            ~tools/
          </a>
          <a
            href="/projects"
            className="block text-white hover:text-primaryDefault py-2"
          >
            ~projects/
          </a>
        </nav>
      </div>
    </div>
  );
};

export default SemiNavbar;
