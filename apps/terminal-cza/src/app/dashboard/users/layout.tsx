

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full h-full bg-neutral-900">
      {children}
    </div>
  );
}
