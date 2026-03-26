import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import ProcessSection from "@/components/home/ProcessSection";
import FeaturedWorkSection from "@/components/home/FeaturedWorkSection";
import AboutPreview from "@/components/home/AboutPreview";
import BlogPreview from "@/components/home/BlogPreview";
import ClientsSection from "@/components/home/ClientsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => (
  <>
    <Navbar />
    <main>
      <HeroSection />
      <ServicesSection />
      <ProcessSection />
      <FeaturedWorkSection />
      <AboutPreview />
      <BlogPreview />
      <ClientsSection />
      <CTASection />
    </main>
    <Footer />
  </>
);

export default Index;
