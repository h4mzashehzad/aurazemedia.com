
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Portfolio } from "@/components/Portfolio";
import { Team } from "@/components/Team";
import { Pricing } from "@/components/Pricing";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div id="hero">
        <Hero />
      </div>
      <Portfolio />
      <Team />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
