"use client"

/* --- Components ------------------------------------------------------------------------------- */
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Navbar ---------------------------------------------------------- */
export default function Navbar() {
  return (
    <>
      {/* --- Desktop -------------- */}
      <DesktopNavbar className="hidden lg:block" />
      {/* --- Mobile --------------- */}
      <MobileNavbar className="lg:hidden" />
    </>
  );
}

