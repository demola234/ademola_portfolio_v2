import { FC } from "react";
import synergy_logo from "../../assets/synergy.png";
interface EmployerProps {
  title: string;
  date_started: string;
  date_end: string;
  logo: string;
  responsibilities: string[];
}

const Employer: FC<EmployerProps> = ({
  title,
  date_started,
  date_end,
  responsibilities,
}) => {
  return (
    <div className="flex flex-col w-full md:flex-row ">
      <div className=" flex border-neutralLight/40 border-[.75px] w-[113px] aspect-video h-[111px] sm:border-b-0">
        <img src={synergy_logo} alt={title} className="" />
      </div>
      <div className="border-1 border-[#4A4A4A] md:basis-[90%] p-[29px_15px] border ">
        <h3 className="text-[1.25rem] font-semibold mb-[0.875rem]">{title}</h3>
        <p className="text-[1.155rem] font-medium mb-[11px]">
          {date_started} - {date_end}
        </p>
        <ul className="text-[0.875rem]  px-[15px] list-disc	font-semibold">
          {responsibilities &&
            responsibilities.map((res) => (
              <li className=" mb-4 lg:w-[110ch]">{res}</li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Employer;
