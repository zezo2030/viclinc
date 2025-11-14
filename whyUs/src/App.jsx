import Header from './sections/Header';
import Hero from './sections/Hero';
import About from './sections/About';
import SocialProof from './sections/SocialProof';
import Features from './sections/Features';
import Options from './sections/Options';
import Benefits from './sections/Benefits';
import WhyChooseUs from './sections/WhyChooseUs';
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
        <About />
        <SocialProof />
        <Features />
        <Options />
        <Benefits />
        <WhyChooseUs />
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
