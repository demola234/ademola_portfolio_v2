// import { PlusIcon } from "../../assets/svg";
import IconContainerForLearning from "./currentlylearning/IconContainerForLearning";

const CurrentlyLearning = () => {
  return (
    <div className="w-full flex flex-col mt-[63px]">
      <div>
        <h1 className="text-[20px] font-[600]">Currently Learning</h1>
        <p className="text-[#D3D3D3] text-[13px] mt-[14px]">
          Other things i am currently learning or planning to learn
        </p>
      </div>
      <IconContainerForLearning />
    </div>
  );
};

export default CurrentlyLearning;
