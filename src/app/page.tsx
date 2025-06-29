import CTA from "@/components/CTA";
import Featured from "@/components/Featured";
import HomeHero from "@/components/HomeHero";
import Pricing from "@/components/Pricing";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
   <>
   <HomeHero />
   <Stats />
   <Featured />
   <Testimonials />
   <Pricing />
   <CTA />
   {/* <Footer /> */}
   </>
  );
}
