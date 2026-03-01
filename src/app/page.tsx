import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeatureSection } from "@/components/FeatureSection";
import { VerifyBot } from "@/components/VerifyBot";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">

      <Navbar />

      <div className="w-full max-w-[1400px] mx-auto px-6 pt-20 pb-20 flex flex-col gap-40 relative z-10">
        <HeroSection />
        <FeatureSection />
      </div>

      <VerifyBot />
    </main>
  );
}
