// import { useState } from "react";
// import {
//   DartIcon,
//   DockerIcon,
//   FlutterIcon,
//   GitIcon,
//   GoIcon,
//   MongoIcon,
//   PlusIcon,
//   PostgresIcon,
//   SolidityIcon,
//   SwiftIcon,
//   TypescriptIcon,
// } from "../../assets/svg";
import { IconsContainer } from "./IconsContainer";

const Tools = () => {
  // const [toolText, setToolText] = useState("Building Cool Stuff with Tools");

  // CSS Animation
  // const crispyAnimation = `
  //   @keyframes crispy {
  //     0%, 100% { transform: scale(1); }
  //     25% { transform: scale(1.05) rotate(-1deg); }
  //     50% { transform: scale(1) rotate(1deg); }
  //     75% { transform: scale(0.95) rotate(0deg); }
  //   }

  //   .crispy:hover {
  //     animation: crispy 0.5s infinite;
  //   }
  // `;

  // Update the toolText state to reflect the tool being hovered over
  // const handleMouseEnter = (toolName: string) => {
  //   setToolText(`Building Cool Stuff with ${toolName}`);
  // };

  // const handleMouseLeave = () => {
  //   setToolText("Building Cool Stuff with Tools");
  // };

  return (
    <div className="mt-[43px] w-full">
      <h1 className="text-[20px] font-[600]">Tools</h1>
      <IconsContainer />
      {/* <div className="w-full bg-[#1E1E1E]/30 grid-cols-6  grid  border border-[#3D3D3D]/50 relative">
        <div className="absolute -right-[8px] -top-[8px]">
          <PlusIcon />
        </div>
        <div className="absolute -left-[8px] -bottom-[8px]">
          <PlusIcon />
        </div>
        <div className="lg:col-span-2  border flex items-center border-[#3D3D3D]/50 py-[26px] pl-[21px] pr-[40px]">
          <h1 className="text-[20px] font-[600]">{toolText}</h1>
          <style>{crispyAnimation}</style>
        </div>
        <div
          onMouseEnter={() => handleMouseEnter("Flutter")}
          onMouseLeave={handleMouseLeave}
          className="flex h-full border cursor-pointer border-[#3D3D3D]/50 justify-center items-center"
        >
         <IconsContainer/>
        </div>
        <div className="flex justify-center border py-[66px] px-[21px] border-[#3D3D3D]/50 items-center">
          <GoIcon />
        </div>
        <div className="flex justify-center border py-[26px] px-[21px] border-[#3D3D3D]/50 items-center">
          <SwiftIcon />
        </div>
        <div className="flex justify-center border py-[26px] px-[21px] border-[#3D3D3D]/50 items-center">
          <DartIcon />
        </div>
        <div className="flex justify-center border py-[26] px-[21px] border-[#3D3D3D]/50 items-center">
          <PostgresIcon />
        </div>
        <div className="flex justify-center border py-[66px] px-[21px] border-[#3D3D3D]/50 items-center">
          <TypescriptIcon />
        </div>
        <div className="flex justify-center border py-[26px] px-[21px] border-[#3D3D3D]/50 items-center">
          <GitIcon />
        </div>
        <div className="flex justify-center border py-[26] px-[21px] border-[#3D3D3D]/50 items-center">
          <DockerIcon />
        </div>
        <div className="flex justify-center border py-[26] px-[21px] border-[#3D3D3D]/50 items-center">
          <MongoIcon />
        </div>
        <div className="flex justify-center border py-[26] px-[21px] border-[#3D3D3D]/50 items-center">
          <SolidityIcon />
        </div>
      </div> */}
    </div>
  );
};

export default Tools;
