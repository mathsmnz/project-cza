import Link from "next/link";
import CzaLogo from "./cza-logo";

export default function NavBar() {
  return (
    <nav className="border-b-2 border-white">
      <div className="flex items-center justify-between max-w-8xl mx-auto px-4  lg:px-8 py-4">
        <Link href="/">
          <CzaLogo />
        </Link>
      </div>
    </nav>
  );
}
