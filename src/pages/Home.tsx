// import Companies from "../components/home/Companies";
import { useEffect } from "react";
import CurrentlyLearning from "../components/home/CurrentlyLearning";
import Hero from "../components/home/Hero";
// import Projects from "../components/home/Projects";
import SemiNavbar from "../components/home/SemiNavbar";
import Tools from "../components/home/Tools";
import Footer from "../layout/rootLayout/Footer";

const Home = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
  return (
    <div>
      <Hero />
      <SemiNavbar />
      <Tools />
      <CurrentlyLearning />
      <Footer />
      {/* <Projects />
      <Companies /> */}
    </div>
  );
};

export default Home;
