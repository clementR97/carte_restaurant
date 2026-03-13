'use client';

import { useState } from 'react';
import logo from '../public/logo.png';

export default function NavBar(){
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    return(
    <>    
<nav className="bg-sky-500/50 fixed w-full z-20 top-0 start-0 border-b border-default text-white">
  <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
    <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
        <img src={logo.src} className="size-35" alt="KaruFoods Logo"/>
        <span className="self-center text-xl text-heading font-semibold whitespace-nowrap">KaruFoods</span>
    </a>
    <div className="flex md:order-2 items-center rtl:space-x-reverse">
        <button type="button" className=" hidden md:inline-flex text-white bg-sky-400 hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium rounded-full text-base px-5 py-3 focus:outline-none">Commander</button>
        <button
            type="button"
            className="rounded-full inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-body md:hidden hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="navbar-sticky"
        >
            <span className="sr-only">{menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
            {menuOpen ? (
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14"/></svg>
            )}
        </button>
    </div>
    <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex items-center justify-between w-full md:w-auto md:order-1`} id="navbar-sticky">
      <ul className="flex flex-col items-center text-center w-full p-4 md:p-0 mt-4 font-medium  rounded-base bg-neutral-secondary-soft md:flex-row md:w-auto md:items-stretch md:text-left md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-neutral-primary">
        <li>
          <a href="#" className="block py-2 px-3 text-white bg-brand rounded-sm border border-white md:border-0 md:bg-transparent md:text-fg-brand md:p-0" aria-current="page" onClick={() => setMenuOpen(false)}>Home</a>
        </li>
        <li>
          <a href="#" className="block py-2 px-3  text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent" onClick={() => setMenuOpen(false)}>About</a>
        </li>
        <li>
          <a href="#" className="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent" onClick={() => setMenuOpen(false)}>Services</a>
        </li>
        <li>
          <a href="#" className="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent" onClick={() => setMenuOpen(false)}>Contact</a>
        </li>
        <li>
        <button type="button" className=" md:hidden text-white bg-sky-400 hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium rounded-full text-base px-5 py-3 focus:outline-none">Commander</button>

        </li>
      </ul>
    </div>
  </div>
</nav>
</>
)
}