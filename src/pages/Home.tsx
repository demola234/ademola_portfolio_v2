import { useEffect } from "react";
import CurrentlyLearning from "../components/home/CurrentlyLearning";
import Hero from "../components/home/Hero";
import Projects from "../components/home/Projects";
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
      <Tools />
      <CurrentlyLearning />
      <Projects />
      <Footer />

      {/* <Companies /> */}
    </div>
  );
};

export default Home;
