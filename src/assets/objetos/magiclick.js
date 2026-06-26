// Datos del objeto "Magiclick" para el componente <ObjectDetail/>.
//
// Los 6 niveles de síntesis se importan como TEXTO crudo (?raw) en vez de URL,
// porque el componente los renderiza inline y reemplaza el fill #DB1B00 por
// `currentColor` para poder recolorearlos por CSS (ver ObjectDetail.jsx).
//
//   nivel 1 → fotografía real del objeto (raster, no recoloreable)
//   nivel 2-5 → versiones cada vez más vectorizadas (foto + acentos vectoriales)
//   nivel 6 → forma final en el lenguaje del toolkit de DEPURA (vector puro)

const rawModules = import.meta.glob('./magiclick/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
})

// Ordena nivel1 … nivel6 según el número del nombre de archivo.
const niveles = Object.entries(rawModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, svg]) => svg)

export const magiclick = {
  nombre: 'Magiclick',
  niveles, // [nivel1 … nivel6] como strings SVG
  colores: [
    { nombre: 'Beige', hex: '#FDE8BE' },
    { nombre: 'Celeste', hex: '#65C6F7' },
    { nombre: 'Bordó', hex: '#761717' },
    { nombre: 'Rojo', hex: '#DB1B00' },
  ],
  // Formas del toolkit de DEPURA que componen la síntesis final.
  formas: ['semicirculo', 'rectangulo'],
}

export default magiclick
