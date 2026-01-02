import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: 'Home', href: '/', component: Link },
  { label: 'Offerings', href: '/offerings', component: Link },
  { label: 'Social', href: '/#social', component: 'a' },
  // { label: 'Report a problem', href: '/report', component: Link },
];

const LINK_CLASSES = "text-[clamp(12px,1.6vw,20px)] font-normal tracking-[clamp(0.6px,0.14vw,1.8px)] leading-[1.05] text-white opacity-98 transition duration-150 ease-out hover:opacity-100";
const MOBILE_LINK_CLASSES = "text-[clamp(16px,2.4vw,24px)] font-normal tracking-[clamp(0.6px,0.14vw,1.8px)] leading-[1.05] text-black opacity-98 transition duration-150 ease-out hover:opacity-100 py-2";

export default function Header() {

    const [isMenuOpen, setIsMenuOpen] = useState(false);


    const toggleMenu = () => {
        setIsMenuOpen(prev=>(!prev));
    };

    return (      <div className="w-full h-24 bg-quickshaw-black mb-0">
            <div className="max-w-[min(1280px,92vw)] mx-auto h-full py-0 px-[clamp(16px,3vw,48px)] flex items-center justify-between gap-6 
            [padding-left:calc(env(safe-area-inset-left)+clamp(16px,3vw,48px))]
            [padding-right:calc(env(safe-area-inset-right)+clamp(16px,3vw,48px))]">
              <a className="inline-flex items-center ml-[clamp(0px,0.5vw,8px)]" href="">
                <Image
                  src="/quickshaw-logo.png"
                  alt="QuickShaw"
                  height={36}
                  width={160}
                  priority
                />
              </a>
    
              <nav className="ml-auto hidden items-center gap-10 pr-px sm:flex">
                {navLinks.map((item)=>{
                  const Component = item.component;
    
                  return(
                    <Component key = {item.href}
                    href = {item.href}
                    className={LINK_CLASSES}
                    >
                      {item.label}
                    </Component>
                  )
                })}
              </nav>
    
              {/* ⬇️ replaces the old empty placeholder; only shows on mobile */}
              <button onClick={toggleMenu} className="inline-flex flex-col items-center cursor-pointer justify-center w-[44px] h-[44px] rounded-[10px] sm:hidden relative z-50" aria-expanded={isMenuOpen}>
                <span className="block w-[22px] h-[2px] bg-white rounded-sm my-[4px] opacity-95"></span>
                <span className="block w-[22px] h-[2px] bg-white rounded-sm my-[4px] opacity-95"></span>
                <span className="block w-[22px] h-[2px] bg-white rounded-sm my-[4px] opacity-95"></span>
              </button>
            </div>
    
            {isMenuOpen &&(
              <div className="sm:hidden w-full pb-4 border-t border-gray-700 bg-quickshaw-black relative z-50">
                <div className="flex flex-col space-y-3 justify-center max-w-[min(1280px,92vw)] py-4 [padding-left:calc(env(safe-area-inset-left)+clamp(16px,3vw,48px))]
            [padding-right:calc(env(safe-area-inset-right)+clamp(16px,3vw,48px))] mx-auto">
                  {navLinks.map((item)=>{
                  const Component = item.component;
    
                  return(
                    <Component key = {item.href}
                    href = {item.href}
                    className={MOBILE_LINK_CLASSES}
                    onClick={toggleMenu}
                    >
                      {item.label}
                    </Component>
                  )
                })}
                </div>
              </div>
            )}
          </div>);
};