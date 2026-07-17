// Datos del objeto "Calculadora Cifra 121" para el componente <ObjectDetail/>.
// Mismo patrón que magiclick.js: los niveles de síntesis se importan como TEXTO
// crudo (?raw) para que ObjectDetail los renderice inline y pueda recolorearlos.
//
//   nivel 1 → fotografía real del objeto (raster embebido, no recoloreable)
//   nivel 2-3 → versiones cada vez más vectorizadas
//   nivel 4 → forma final en el lenguaje del toolkit de DEPURA (vector puro)

const rawModules = import.meta.glob('./calculadora/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
})

// Los SVG tienen lienzos casi cuadrados y su contenido los llena en distinta
// medida, así que sin ajuste cada nivel se ve de un tamaño distinto. Expandimos
// el viewBox de cada uno agregando padding alrededor del contenido: un viewBox
// más grande hace que el mismo contenedor de ObjectDetail dibuje el objeto más
// chico. Con un factor por grupo emparejamos el tamaño relativo de todos los
// niveles (sin salto de escala al mover el slider) y los mantenemos contenidos
// en el círculo, al tamaño de los SVG de Magiclick.
// (Ajustá los factores si hace falta: más alto = objeto más chico.)
const FACTOR_NIVEL1 = 1.2 // foto real (nivel 1): llena menos el lienzo → menos padding
const FACTOR_CONTENCION = 1.45 // vectorizados (nivel 2-4): llenan más → más padding

function expandirViewBox(svg, factor) {
  return svg.replace(/viewBox="([^"]+)"/, (_, vb) => {
    const [x, y, w, h] = vb.trim().split(/[\s,]+/).map(Number)
    const nw = w * factor
    const nh = h * factor
    return `viewBox="${x - (nw - w) / 2} ${y - (nh - h) / 2} ${nw} ${nh}"`
  })
}

// Los SVG de la calculadora usan otros colores de fill que los de Magiclick:
// #FDE8BE (cuerpo) y #761717 (detalle). ObjectDetail solo recolorea los
// sentinelas #DB1B00 (cuerpo) y #64C6F7 (detalle), así que normalizamos los
// fills a esos sentinelas: de ahí en más el selector de color funciona igual
// que en Magiclick (cuerpo = color elegido, detalle = color de contraste).
function normalizarFills(svg) {
  return svg
    .replace(/fill="#FDE8BE"/gi, 'fill="#DB1B00"')
    .replace(/fill="#761717"/gi, 'fill="#64C6F7"')
}

// El nivel 4 (forma final del toolkit) se genera acá en código en vez de usar el
// SVG externo: es un rectángulo simple beige. Va en el MISMO viewBox que el
// nivel 3 (902×798) y cubre su mismo footprint (la silueta de la calculadora:
// x 126→773, y 28→748), así al pasar de nivel 3 a 4 no hay salto de escala y
// queda igual de contenido en el círculo. El fill beige se normaliza como el
// resto de los niveles, así que el selector de color también lo afecta.
const NIVEL4_RECT =
  '<svg width="902" height="798" viewBox="0 0 902 798" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<rect x="126" y="28" width="647" height="720" fill="#FDE8BE"/>' +
  '</svg>'

// Niveles 1-3 desde archivo (ordenados por número); el nivel 4 es el generado.
const crudos = [
  ...Object.entries(rawModules)
    .filter(([ruta]) => !ruta.includes('nivel4'))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, svg]) => svg),
  NIVEL4_RECT,
]

const niveles = crudos.map((svg, i) =>
  normalizarFills(expandirViewBox(svg, i === 0 ? FACTOR_NIVEL1 : FACTOR_CONTENCION)),
)

export const calculadora = {
  nombre: 'Calculadora Cifra 121',
  niveles, // [nivel1 … nivel4] como strings SVG
  colores: [
    { nombre: 'Beige', hex: '#FDE8BE' },
    { nombre: 'Celeste', hex: '#65C6F7' },
    { nombre: 'Bordó', hex: '#761717' },
    { nombre: 'Rojo', hex: '#DB1B00' },
  ],
  // Forma del toolkit que compone la síntesis final: un rectángulo.
  formas: ['rectangulo'],
}

export default calculadora
