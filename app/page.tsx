"use client";

import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import Stats from "../components/Stats";
import Projects from "../components/Projects";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <div className="flex-grow flex flex-col">
      <main className="flex-grow">
        <Hero />
        <About />
        <Services />
        <Stats />
        <Projects />
        <Testimonials />
        <Contact />
      </main>
    </div>
  );
}
