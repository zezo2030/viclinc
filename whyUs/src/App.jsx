import Header from './sections/Header';
import Hero from './sections/Hero';
import SocialProof from './sections/SocialProof';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import Integrations from './sections/Integrations';
import Showcase from './sections/Showcase';
import DashboardGallery from './sections/DashboardGallery';
import Testimonials from './sections/Testimonials';
import FAQ from './sections/FAQ';
import CTA from './sections/CTA';
import Footer from './sections/Footer';
import './App.css';

function App() {
  return (
    <div className="smooth-scroll">
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <Integrations />
        <Showcase />
        <DashboardGallery />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
