/* eslint-disable no-irregular-whitespace */
import { useEffect, useState } from "react";
import StarAnimation from "../../animations/StarAnimation";
import hero from "../../assets/hero.png";
import { HeroImage, PlusIcon } from "../../assets/svg";

const Hero = () => {
  const [scrollY, setScrollY] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Add scroll event listener when component mounts
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate how much the image should be translated based on the scroll position.
  const translateY = scrollY * 0.1;

  return (
    <div className="w-full bg-[#1E1E1E]/30 grid lg:grid-cols-4 gap-x-[32px] border border-[#3D3D3D]/50 relative">
      {/* Decorative Icons */}
      <div className="absolute -right-[8px] -top-[8px]">
        <PlusIcon />
      </div>
      <div className="absolute -left-[8px] -bottom-[8px]">
        <PlusIcon />
      </div>
      <div className="absolute right-0 top-0">
        <HeroImage />
      </div>

      {/* Hero Image Section */}
      <div className="overflow-hidden h-[329px] bg-primaryDefault relative flex justify-center">
        <img
          src={hero}
          alt="Hero"
          className="eating-image object-cover"
          style={{ transform: `translateY(${translateY}px)` }}
        />
        <div className="card-hello-right-circles">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="card-hello-right-circle" />
          ))}
        </div>
        <div className="absolute top-0 left-0">
          <StarAnimation />
        </div>
      </div>

      {/* Text Content Section */}
      <div className="lg:col-span-3 lg:pr-[32px] lg:py-0 py-[10px] h-full flex flex-col justify-center">
        <h1 className="lg:text-[23px] text-[16px] font-bold">
          Hi, I’m Ademola 👋🏾
        </h1>
        <p className="lg:text-[18px] text-[14px] lg:mt-[8px] mt-[12px] leading-relaxed">
          I am an{" "}
          <span className="text-primaryDefault">
            Innovative and results-driven
          </span>
          Software Engineer with 4+ years of experience across mobile and
          backend development. My expertise spans{" "}
          <span className="text-primaryDefault">Flutter, UIKit, SwiftUI</span>,
          and backend technologies like
          <span className="text-primaryDefault"> Go</span>,{" "}
          <span className="text-primaryDefault">Python (FastAPI)</span>, and
          modern
          <span className="text-primaryDefault"> blockchain solutions</span>. I
          excel at building scalable, user-centric applications with clean
          architecture, CI/CD pipelines, and robust testing strategies.
          <br />
          <br />
          Passionate about{" "}
          <span className="text-primaryDefault">Machine Learning</span>, I
          develop solutions that leverage data to drive insights and innovation.{" "}
          <span className="text-primaryDefault">new technologies</span>, sharing
          knowledge through
          <span className="text-primaryDefault"> writing</span>, and building
          tools to empower the developer community. I’m always excited to tackle
          complex challenges and create value-driven software solutions.
        </p>
      </div>
    </div>
  );
};

export default Hero;
