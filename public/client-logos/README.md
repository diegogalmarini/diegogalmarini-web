# Logos de Clientes Reales

## Instrucciones para agregar logos de clientes

### 📁 Ubicación
Coloca todos los logos de clientes en esta carpeta: `public/client-logos/`

### 📏 Especificaciones técnicas

**Formato recomendado:**
- **SVG** (preferido - escalable y súper liviano)
- PNG con fondo transparente (alternativa)
- WebP (para máxima compresión)

**Tamaño:**
- **Ancho máximo:** 200px
- **Alto máximo:** 100px
- **Peso máximo:** 10KB por archivo

**Color:**
- **Monocromático:** Gris oscuro (#374151) o negro (#000000)
- **Fondo:** Transparente
- **Estilo:** Minimalista, sin efectos especiales

### 📝 Nomenclatura
Nombra los archivos como:
- `cliente01.svg`
- `cliente02.svg`
- `cliente03.png`
- etc.

### 🔧 Configuración automática
El sistema detectará automáticamente todos los archivos en esta carpeta y los incluirá en la rotación de logos.

### ✅ Ejemplo de logo optimizado
```svg
<svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <text x="60" y="35" text-anchor="middle" fill="#374151" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
    CLIENTE
  </text>
</svg>
```

### 📋 Checklist antes de subir
- [ ] Archivo en formato SVG o PNG
- [ ] Fondo transparente
- [ ] Color monocromático
- [ ] Tamaño menor a 10KB
- [ ] Dimensiones apropiadas (máx 200x100px)
- [ ] Nomenclatura correcta (cliente##.extensión)