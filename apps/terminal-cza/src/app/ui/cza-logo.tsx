import { montserrat } from '@/app/ui/fonts';

export default function CzaLogo() {
  return (
    <div
      className={`${montserrat.className} flex flex-row items-center leading-none text-white`}
    >
      <p className="text-4xl">CZA+</p>
    </div>
  );
}
