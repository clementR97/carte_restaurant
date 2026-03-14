import Image from "next/image";
import NavBar from "./navbar";
import Hero from "./hero";
import Menu from "./menu";
export default function Home() {
  return (
    <div className="flex flex-col">
    <NavBar />
    <Hero />
    <Menu />
    </div>
  )
}
