import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="w-full h-full">
        <div className="grid grid-cols-1 sm:grid-cols-5 items-stretch h-screen">

          {/* Imagem da capa */}
          <div className="relative sm:col-span-2 sm:border-b-0 md:border-r-2 border-neutral-200 h-full w-full">
            <Image
              src="/casa.png"
              alt="casa"
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Texto e informações */}
          <div className="sm:col-span-3 flex flex-col justify-center px-8 py-16">
            <h1 className="text-5xl font-semibold text-white">CZA+ Terminal</h1>
            <div className="mt-6 text-xl text-gray-300 leading-relaxed">
              <p>Gerenciamento do customizador em massa de projetos para habitações</p>
              <br />
              <p>
                Uma proposta de sistema de co-design para a edição <br />
                e visualização dos arquivos IFC de projetos BIM
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="bg-white text-black rounded-full py-4 px-12 inline-block hover:bg-gray-200 transition"
              >
                Começar
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-8">
              Menezes Dev. / GEGRADI / UFPel / 2025
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
