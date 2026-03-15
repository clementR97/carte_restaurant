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
    <Menu />
    <Footer />
    </div>
  )
}
