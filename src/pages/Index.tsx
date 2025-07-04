
import { Hero } from "@/components/Hero";
import { Portfolio } from "@/components/Portfolio";
import { Team } from "@/components/Team";
import { Pricing } from "@/components/Pricing";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Portfolio />
      <Team />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
