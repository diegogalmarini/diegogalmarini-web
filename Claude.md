# 🎨 Directrices Técnicas, Estética Premium y Branding (Claude.md)

Este documento detalla las directrices obligatorias de diseño, desarrollo de software, estándares UX/UI y normas técnicas que rigen la plataforma y el CRM SaaS de **Diego Galmarini**.

---

## 🛠️ Stack Tecnológico Estándar

*   **Core**: React 18 con TypeScript y bundler ultra-rápido Vite.
*   **Routing**: React Router DOM (v6 con `future` transitions activas para transiciones fluidas de renderizado).
*   **Backend & DB**: Firebase (Authentication para protección de roles `admin`/`client`, Firestore para base de datos reactiva y almacenamiento de Leads/Tareas).
*   **Estilos y CSS**: Tailwind CSS con variables CSS dinámicas en `:root` y `[data-theme="dark"]` para control total del cambio de temas.

---

## 💎 Directrices de Estética Premium e Identidad Visual

Para deslumbrar a los usuarios y mantener un aspecto de nivel internacional, aplica estrictamente las siguientes reglas visuales:

### 1. Glassmorphism de Alta Legibilidad y Contraste
*   **El problema**: Las tarjetas translúcidas con demasiada transparencia sufren de sangrado de texto de fondo ("text bleed-through"), lo que dificulta la lectura.
*   **La regla obligatoria**: Todos los modales, paneles flotantes y tarjetas de cristal flotantes deben seguir una opacidad estricta de **90% de opacidad (10% de transparencia)** combinada con desenfoque de fondo robusto y borde sutil:
    ```css
    .modal-glass-content {
      @apply bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-[var(--border-color)] rounded-2xl shadow-2xl;
    }
    ```
*   **Backdrop Overlay**: El contenedor del fondo de las modales debe usar un oscurecimiento sutil pero de alto contraste:
    ```tsx
    bg-black bg-opacity-40 backdrop-blur-sm
    ```

### 2. Paleta de Colores de Alta Gama (Harmonious Colors)
*   **Evita colores planos genéricos**: Queda estrictamente prohibido usar azul puro, rojo puro o verde puro.
*   **Estándar de marca**:
    *   *Tema Claro*: Fondos limpios blancos y grises ultra-claros (`#ffffff`, `#f9fafb`), textos en grises oscuros profundos (`#1f2937`), y acentos en un elegante azul degradado a violeta (`#3b82f6` ➜ `#a855f7`).
    *   *Tema Oscuro*: Fondos en gris zinc profundo (`#111827`, `#1f2937`), textos en blanco brillante y gris tiza (`#f9fafb`, `#d1d5db`), bordes en gris pizarra suave (`#374151`).

### 3. Tipografía y Micro-animaciones Dinámicas
*   Utiliza fuentes limpias y de aspecto moderno sin ser recargadas (Inter, Outfit, Roboto).
*   **Hover effects de alta respuesta**: Usa `hover-lift` y transiciones suaves para botones y tarjetas:
    ```css
    .hover-lift {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .hover-lift:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    ```

---

## 🌐 Estándar de Enrutamiento Bilingüe y SEO Completo

Para que el SEO y el AEO (Optimización para Motores de Respuestas por IA) sean 100% efectivos, toda la web pública debe regirse por las siguientes directrices de idioma:

### 1. La URL como Única Fuente de Verdad
*   El estado del idioma se sincroniza automáticamente con el prefijo de la ruta URL:
    *   `/en`, `/en/services`, `/en/blog`, `/en/blog/:slug` ➜ Idioma Inglés (`'en'`).
    *   `/`, `/services`, `/blog`, `/blog/:slug` ➜ Idioma Español (`'es'`).
*   **Cero Redirecciones Circulares**: El componente `AppContent` escucha los cambios de ruta y actualiza el `LanguageContext` reactivamente, evitando bucles infinitos de sincronización.

### 2. Navegación Consciente del Camino (Path-Aware)
*   Todos los enlaces internos del encabezado y pie de página deben auto-adaptarse usando la función bilingüe `getPath(path)`:
    ```tsx
    const getPath = (path: string) => getLocalizedPath(path, language);
    ```
*   **Toggles inteligentes de idioma**: Cambiar entre `ES` y `EN` debe redirigir al usuario a la ruta equivalente de su ubicación actual. Ejemplo: si estás leyendo `/blog/anthropic-claude-3-5-sonnet` y haces clic en `ES`, el sistema debe navegar a `/blog/anthropic-claude-3-5-sonnet` en lugar de botarte a `/`.

### 3. SEO Bilingüe, Hreflang y Esquemas JSON-LD
*   Cada página pública debe inyectar dinámicamente sus meta-etiquetas (`document.title`, `description`, etiquetas OpenGraph y Twitter) en concordancia con el idioma actual de la URL.
*   Se inyectarán de forma dinámica scripts estructurados en formato **JSON-LD** (`TechArticle` para artículos individuales y `CollectionPage` para listados) para optimizar el descubrimiento por asistentes de IA y el robot de indexación de Google.
*   El archivo `/sitemap.xml` debe contener las directivas hreflang de correspondencia exacta para que Google asocie las versiones paralela en inglés y español.

---

## 🚫 Restricción Estricta de Marcadores de Posición (Placeholders)
*   Queda estrictamente prohibido dejar imágenes vacías, enlaces rotos o secciones "Lorem Ipsum". 
*   Si una sección requiere material gráfico, utiliza imágenes estéticas de alta definición de Unsplash (como las ya configuradas enconstants.tsx) o genera recursos con la herramienta gráfica del entorno para garantizar que el SaaS se sienta siempre como un producto terminado de calidad Premium.
