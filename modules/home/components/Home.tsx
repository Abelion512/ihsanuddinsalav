import Breakline from "@/common/components/elements/Breakline";

import Introduction from "./Introduction";
import SkillList from "./SkillList";
import TikTokCard from "./TiktokCard";
// import BentoGrid from "./Bento/BentoGrid";

const Home = () => {
  return (
    <>
      <Introduction />
      <Breakline className="my-8" />
      <SkillList />
      {/* <Breakline className="my-8" /> */}
      {/* <BentoGrid /> */}
      <Breakline className="my-8" />
      <TikTokCard/>
    </>
  );
};

export default Home;
