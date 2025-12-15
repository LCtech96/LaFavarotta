export function StaffSection() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Restaurant Description */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          La Favarotta
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Il Ristorante La Favarotta nasce dalla passione per la cucina siciliana e il desiderio 
          di offrire ai nostri ospiti un&apos;esperienza culinaria autentica e indimenticabile. 
          Situato lungo la Strada Statale 113 a Terrasini, il nostro ristorante unisce la tradizione 
          della cucina di pesce siciliana con l&apos;arte della pizza, creando un menu che celebra 
          i sapori del territorio.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          La nostra sala banchetti è il luogo ideale per celebrare i momenti più importanti della vita, 
          mentre il ristorante accoglie ogni giorno chi desidera gustare l&apos;eccellenza della cucina 
          siciliana in un ambiente elegante e accogliente.
        </p>
      </section>

      {/* Owner */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Il Titolare
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 mx-auto md:mx-0"></div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Leone Vincenzo
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Con una passione per la cucina che dura da oltre vent&apos;anni, Leone Vincenzo ha 
              trasformato La Favarotta in un punto di riferimento per la gastronomia siciliana. 
              La sua dedizione alla qualità e all&apos;autenticità si riflette in ogni piatto che 
              esce dalla nostra cucina.
            </p>
          </div>
        </div>
      </section>

      {/* Chefs */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          I Nostri Chef
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Chef del Pesce
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              Il nostro chef specializzato in cucina di pesce seleziona quotidianamente il pesce 
              più fresco dai mercati locali, preparando piatti che esaltano i sapori del mare siciliano.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Pizzaiolo
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              Il nostro pizzaiolo maestro porta avanti la tradizione della pizza siciliana, 
              utilizzando ingredienti di prima qualità e tecniche artigianali per creare pizze 
              uniche e deliziose.
            </p>
          </div>
        </div>
      </section>

      {/* Staff */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Il Nostro Staff
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Il nostro team è composto da professionisti appassionati che condividono l&apos;amore 
          per la cucina siciliana e l&apos;impegno nel garantire a ogni ospite un&apos;esperienza 
          indimenticabile. Dal servizio in sala alla preparazione in cucina, ogni membro del nostro 
          staff contribuisce a rendere La Favarotta un luogo speciale dove tradizione e qualità si 
          incontrano.
        </p>
      </section>
    </div>
  )
}

