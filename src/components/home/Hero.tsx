import { HeroImage, PlusIcon } from "../../assets/svg";
import hero from "../../assets/hero.png";
import heroshape from "../../assets/heroshape.png";
import { useEffect, useState } from "react";
import StarAnimation from "../../animations/StarAnimation";
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
  // Adjust the factor to control the speed of the movement.
  const translateY = scrollY * 0.1;
  return (
    <div className="w-full bg-[#1E1E1E]/30 grid lg:grid-cols-4 gap-x-[32px] border border-[#3D3D3D]/50 relative ">
      <div className="absolute -right-[8px] -top-[8px]">
        <PlusIcon />
      </div>
      <div className="absolute -left-[8px] -bottom-[8px]">
        <PlusIcon />
      </div>
      <div className="absolute right-0 top-0">
        <HeroImage />
      </div>
      <div className="  overflow-hidden h-[329px]  bg-primaryDefault relative flex justify-center ">
        <img
          src={hero}
          alt=""
          className="eating-image object-cover"
          style={{ transform: `translateY(${translateY}px)` }}
        />
        <div className="card-hello-right-circles">
          <div className="card-hello-right-circle" />
          <div className="card-hello-right-circle" />
          <div className="card-hello-right-circle" />
          <div className="card-hello-right-circle" />
          <div className="card-hello-right-circle" />
        </div>
        <div className="absolute top-0 left-0 ">
          <StarAnimation />
        </div>
      </div>
      <div className="lg:col-span-3  lg:pr-[32px] lg:p-[0px] p-[10px] h-full flex flex-col justify-center">
        <h1 className="lg:text-[23px] text-[16px] font-bold">
          Hi, I’m Ademola👋🏾
        </h1>
        <p className="lg:text-[18px] text-[12px] lg:mt-[0px] mt-[8px]">
          A <span className="text-primaryDefault">Software Engineering</span>{" "}
          Passionate about passionate about building intuitive, high-performance
          applications for <span className="text-[#DEE3A4]">iOS</span> and{" "}
          <span className="text-[#DEE3A4]">Android</span>. I enjoy 
          <span className="text-primaryDefault">building</span> things that run
          on computers and and exploring a lot (or a bit) of other tools,
          languages etc while doing that.I 
          <span className="text-primaryDefault">experiment</span> a lot and
          build out my silly ideas and looking forward to building more tools
          for the community moving forward. I also try to do a{" "}
          <span className="text-primaryDefault">bit of writing</span> when I can
          to help people learn from my experiences.
        </p>
      </div>
    </div>
  );
};

export default Hero;
