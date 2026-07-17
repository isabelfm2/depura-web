// Datos de detalle de los objetos de la colección para <ObjectDetail/>.
//
// Mismo patrón que magiclick.js / calculadora.js (niveles como texto SVG crudo),
// pero centralizado: un solo glob carga los niveles de todas las carpetas y cada
// objeto declara nombre y formas. Así sumar un objeto es una entrada más abajo.

const rawModules = import.meta.glob('./*/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const COLORES = [
  { nombre: 'Beige', hex: '#FDE8BE' },
  { nombre: 'Celeste', hex: '#65C6F7' },
  { nombre: 'Bordó', hex: '#761717' },
  { nombre: 'Rojo', hex: '#DB1B00' },
]

// ObjectDetail sólo recolorea estos dos sentinelas (cuerpo y detalle).
const SENTINELA_CUERPO = '#DB1B00'
const SENTINELA_DETALLE = '#64C6F7'

// Cada objeto se exportó con colores de paleta propios (y no siempre los mismos
// entre niveles: p.ej. la radio usa beige de cuerpo en el nivel 2-3 y rojo en el
// 4). Por eso normalizamos POR NIVEL: el fill dominante de ese nivel es el
// cuerpo → sentinela principal, y cualquier otro fill → sentinela de detalle.
// De ahí en más el selector de color funciona igual que en Magiclick.
// Se hace en dos fases con un token temporal para que los reemplazos no se pisen.
function normalizarFills(svg) {
  const conteo = {}
  for (const [, hex] of svg.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)) {
    const c = hex.toUpperCase()
    conteo[c] = (conteo[c] || 0) + 1
  }
  const colores = Object.keys(conteo)
  if (colores.length === 0) return svg // nivel 1: foto raster, sin fills editables

  const cuerpo = colores.reduce((a, b) => (conteo[a] >= conteo[b] ? a : b))
  return svg
    .replace(new RegExp(`fill="${cuerpo}"`, 'gi'), 'fill="__CUERPO__"')
    .replace(/fill="#[0-9A-Fa-f]{6}"/g, `fill="${SENTINELA_DETALLE}"`)
    .replace(/fill="__CUERPO__"/g, `fill="${SENTINELA_CUERPO}"`)
}

// ObjectDetail renderiza todos los niveles en un contenedor global de este tamaño.
const PX_CONTENEDOR = 560

// Algunos objetos tienen los vectores recortados al ras, así que llenan la caja y
// se ven más grandes que su foto (nivel 1, que suele traer aire alrededor). Para
// esos casos el objeto declara `pxVectores`: expandimos el viewBox de los niveles
// 2+ (agregando padding alrededor del contenido) para que rindan como si la caja
// midiera esos px. El nivel 1 nunca se toca.
function expandirViewBox(svg, factor) {
  return svg.replace(/viewBox="([^"]+)"/, (_, vb) => {
    const [x, y, w, h] = vb.trim().split(/[\s,]+/).map(Number)
    const nw = w * factor
    const nh = h * factor
    return `viewBox="${x - (nw - w) / 2} ${y - (nh - h) / 2} ${nw} ${nh}"`
  })
}

function nivelesDe(carpeta, pxVectores) {
  const factor = pxVectores ? PX_CONTENEDOR / pxVectores : 1
  return Object.entries(rawModules)
    .filter(([ruta]) => ruta.startsWith(`./${carpeta}/`))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, svg], i) => {
      const normalizado = normalizarFills(svg)
      return factor === 1 || i === 0 ? normalizado : expandirViewBox(normalizado, factor)
    })
}

function crearObjeto({ carpeta, nombre, formas, pxVectores }) {
  return { nombre, niveles: nivelesDe(carpeta, pxVectores), colores: COLORES, formas }
}

// —— Tanda 1 ————————————————————————————————————————————————
// Las formas se verificaron contra el SVG del nivel 4 de cada carpeta.

export const licuadora = crearObjeto({
  carpeta: 'licuadora',
  nombre: 'Licuadora Aurora',
  formas: ['rectangulo-vertical', 'rectangulo-horizontal'],
})

export const radio = crearObjeto({
  carpeta: 'radio',
  nombre: 'Radio Giulia',
  formas: ['rectangulo-horizontal'],
})

export const televisor = crearObjeto({
  carpeta: 'televisor',
  nombre: 'Televisor Micro 14 NT 320',
  formas: ['cuadrado', 'rectangulo-horizontal'],
  pxVectores: 480, // sus vectores llenan la caja: se ajustan a 480px
})

export const cubiertos = crearObjeto({
  carpeta: 'cubiertos',
  nombre: 'Cubiertos Orfeo',
  formas: ['rectangulo-horizontal', 'circulo'],
})

// —— Tanda 2 ————————————————————————————————————————————————

export const vajilla = crearObjeto({
  carpeta: 'vajilla',
  nombre: 'Juego de Vajilla de Mesa',
  formas: ['semicirculo', 'circulo', 'rectangulo', 'circulo-estirado'],
})

export const sillonBasico = crearObjeto({
  carpeta: 'sillon-basico',
  nombre: 'Sillón Básico',
  // Según el nivel 4: rect 485×331 (horizontal) + rect 379×318 (cuadrado).
  formas: ['rectangulo-horizontal', 'cuadrado'],
})

export const sillaPlaka = crearObjeto({
  carpeta: 'silla-plaka',
  nombre: 'Silla Plaka',
  formas: ['rectangulo-vertical'],
})

export const sillaTrigamba = crearObjeto({
  carpeta: 'silla-trigamba',
  nombre: 'Silla Trigamba',
  formas: ['circulo', 'rectangulo-vertical-fino', 'circulo-estirado'],
})

// —— Tanda 3 ————————————————————————————————————————————————

export const linterna = crearObjeto({
  carpeta: 'linterna',
  nombre: 'Linterna Pop',
  formas: ['rectangulo-horizontal', 'semicirculo'],
})

export const sillonCinta = crearObjeto({
  carpeta: 'sillon-cinta',
  nombre: 'Sillón Cinta',
  formas: ['rectangulo-horizontal', 'rectangulo-vertical'],
})

export const mobiliarioEscolar = crearObjeto({
  carpeta: 'mobiliario-escolar',
  nombre: 'Mobiliario Escolar',
  formas: ['rectangulo-vertical-ancho', 'rectangulo-vertical-fino', 'rectangulo-horizontal-chico'],
})

export const banquetaAlta = crearObjeto({
  carpeta: 'banqueta-alta',
  nombre: 'Banqueta Alta',
  // Según el nivel 4: rect 468×418 (cuadrado, no vertical) + 62×268 + 566×93.
  formas: ['cuadrado', 'rectangulo-vertical-fino', 'rectangulo-horizontal-fino'],
})

// —— Tanda 4 ————————————————————————————————————————————————

export const lamparaOlympia = crearObjeto({
  carpeta: 'lampara-olympia',
  nombre: 'Lámpara colgante Olympia Billar',
  formas: ['rectangulo-vertical-fino', 'semicirculo', 'circulo'],
})
