import NavBar from "../ui/navbar";
import SideNav from "../ui/sidenav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-screen h-screen bg-neutral-900">
      <div className="flex-shrink-0">
        <NavBar />
      </div>
      <div className="flex flex-1 w-full h-full overflow-y-hidden">
        <SideNav />
        <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
      </div>
    </div>
  );
}
