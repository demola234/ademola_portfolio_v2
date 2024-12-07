import Employer from "../components/about/Employer";
import SemiNavbar from "../components/home/SemiNavbar";
import Footer from "../layout/rootLayout/Footer";
import { experience } from "../data/Experience";
const About = () => {
  return (
    <>
      <div className="flex flex-col gap-4">
        <SemiNavbar />
        <h1 className="px-3 font-semibold text-xl/8">
          Professional Experience
        </h1>
      </div>
      <div className="flex-col flex gap-[2.87rem] pt-[1.312rem] mb-[50px]">
        {experience &&
          experience.map((exp) => (
            <Employer
              title={exp.company_name}
              date_started={exp.start_date}
              date_end={exp.end_date}
              logo={exp.image_url}
              responsibilities={exp.responsibilities}
            />
          ))}
      </div>
      <Footer />
    </>
  );
};

export default About;
