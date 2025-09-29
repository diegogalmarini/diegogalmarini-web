export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section con test de estilos Tailwind */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Diego Galmarini
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Socio Tecnológico Estratégico
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Transformando ideas en productos tecnológicos escalables, rentables y desplegados
          </p>
          
          {/* Test de botones con estilos Tailwind */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105">
              Test Button Primary
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200">
              Test Button Secondary
            </button>
          </div>
        </div>
      </section>

      {/* Test Card Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Card Test 1</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Si ves este card con bordes redondeados, sombra y colores correctos, Tailwind está funcionando.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Card Test 2</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Responsive grid, dark mode support, y transiciones suaves son señales de que todo funciona.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Card Test 3</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Typography, spacing, y colores consistentes indican configuración correcta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Debug info */}
      <section className="py-8 px-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
        <div className="container mx-auto text-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            🔧 Debug: Si ves colores, bordes redondeados y responsive design, Tailwind CSS está funcionando correctamente
          </p>
        </div>
      </section>
    </div>
  )
}