import Header from './sections/Header';
import Hero from './sections/Hero';
import SocialProof from './sections/SocialProof';
import Features from './sections/Features';
import Options from './sections/Options';
import WhyChooseUs from './sections/WhyChooseUs';
import Showcase from './sections/Showcase';
import DashboardGallery from './sections/DashboardGallery';
import FAQ from './sections/FAQ';
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
        <Options />
        <WhyChooseUs />
        <Showcase />
        <DashboardGallery />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;
