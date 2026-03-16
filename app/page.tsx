import Image from "next/image";
import NavBar from "./navbar";
import Hero from "./hero";
import Menu from "./menu";
import Footer from "./footer"
export default function Home() {
  return (
    <div className="flex flex-col">
      <NavBar />
      <Hero />
      <section id="menu" className="scroll-mt-16">
        <Menu />
      </section>
      <footer id="contact" className="scroll-mt-16">
        <Footer />
      </footer>
    </div>
  )
}
