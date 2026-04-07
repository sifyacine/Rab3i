import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import ProblemSection from "@/components/home/ProblemSection";
import AboutPreview from "@/components/home/AboutPreview";
import ProcessSection from "@/components/home/ProcessSection";
import ServicesSection from "@/components/home/ServicesSection";
import WhyRab3iSection from "@/components/home/WhyRab3iSection";
import DirectMessageSection from "@/components/home/DirectMessageSection";
import FeaturedWorkSection from "@/components/home/FeaturedWorkSection";
import BlogPreview from "@/components/home/BlogPreview";
import ClientsSection from "@/components/home/ClientsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => (
  <>
    <Navbar />
    <main>
      <HeroSection />
      <ProblemSection />
      <AboutPreview />
      <ProcessSection />
      <ServicesSection />
      <WhyRab3iSection />
      <DirectMessageSection />
      <FeaturedWorkSection />
      <BlogPreview />
      <ClientsSection />
      <CTASection />
    </main>
    <Footer />
  </>
);

export default Index;
