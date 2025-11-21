<template>
    <main className="h-full w-full flex items-center justify-center bg-white">
      <div className="w-full h-full">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-8 items-center h-full w-full">
          
          {/* Seção de conteúdo principal */}
          <div className="sm:col-span-3 px-8 flex flex-col justify-center">
            <h1 className="text-5xl font-semibold">Sobre o Projeto</h1>
            <br />
            
            <p className="text-xl text-gray-600 leading-relaxed">
              CZA+ é um sistema de co-design desenvolvido para democratizar 
              a customização de projetos habitacionais através de tecnologia BIM.
            </p>
            <br />
            
            <h2 className="text-2xl font-semibold">Como Funciona</h2>
            <br />
            
            <div className="space-y-6">
              <div>
                <p className="text-lg text-black">Seleção Intuitiva</p>
                <p className="text-base text-gray-600 leading-relaxed">
                  Interface guiada permite modificações de alto nível, 
                  como "Aumentar sala/cozinha", sem conhecimento técnico.
                </p>
              </div>
              
              <div>
                <p className="text-lg text-black">Configuração Inteligente</p>
                <p className="text-base text-gray-600 leading-relaxed">
                  Motor de configuração filtra opções dinamicamente, 
                  desabilitando escolhas incompatíveis em tempo real.
                </p>
              </div>
              
              <div>
                <p className="text-lg text-black">Feedback Visual</p>
                <p className="text-base text-gray-600 leading-relaxed">
                  Planta atualizada instantaneamente oferece visualização 
                  imediata das mudanças propostas.
                </p>
              </div>
              
              <div>
                <p className="text-lg text-black">Ajustes Paramétricos</p>
                <p className="text-base text-gray-600 leading-relaxed">
                  Manipulação fina permite ajustar dimensões e elementos 
                  específicos para personalização completa.
                </p>
              </div>
            </div>
            <br />
            
            <p className="text-sm text-gray-500">
              Msmenezes Dev. / GEGRADI / UFPel / 2025
            </p>
          </div>
          
          {/* Imagem lateral com borda */}
          <div className="sm:col-span-2 flex justify-center sm:border-b-2 md:border-l-2 border-black sm:justify-end h-full w-full">
            <img alt="casa" rel="preload" fetchpriority="high" src="/casa.png?url" className="w-full h-full object-cover" />
          </div>
          
        </div>
      </div>
    </main>
</template>