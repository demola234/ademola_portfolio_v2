// import Companies from "../components/home/Companies";
import CurrentlyLearning from "../components/home/CurrentlyLearning";
import Hero from "../components/home/Hero";
// import Projects from "../components/home/Projects";
import SemiNavbar from "../components/home/SemiNavbar";
import Tools from "../components/home/Tools";

const Home = () => {
  return (
    <div>
      <Hero />
      <SemiNavbar />
      <Tools />
      <CurrentlyLearning />
      {/* <Projects />
      <Companies /> */}
    </div>
  );
};

export default Home;
