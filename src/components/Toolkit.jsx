import { useEffect, useState } from 'react'
import { shapes } from '../assets/shapes.js'

// 24 pares default → hover. En cada par cambian TANTO la forma como el color.
// (la celda 25, abajo a la derecha, es el logo de DEPURA, fijo)
const PAIRS = [
  ['circulo-bordo', 'elipse-celeste'],
  ['elipse-rojo', 'tres-lineas-beige'],
  ['tres-lineas-celeste', 'circulo-rojo'],
  ['cuatro-lineas-bordo', 'semielipse-stroke-celeste'],
  ['circulo-stroke-celeste', 'cuatro-lineas-rojo'],

  ['semielipse-stroke-rojo', 'elipse-stroke-bordo'],
  ['elipse-celeste', 'circulo-bordo'],
  ['circulo-rojo', 'tres-lineas-celeste'],
  ['tres-lineas-bordo', 'elipse-stroke-celeste'],
  ['elipse-stroke-rojo', 'circulo-stroke-bordo'],

  ['cuatro-lineas-celeste', 'semielipse-stroke-rojo'],
  ['semielipse-stroke-bordo', 'circulo-celeste'],
  ['circulo-celeste', 'cuatro-lineas-bordo'],
  ['elipse-bordo', 'tres-lineas-rojo'],
  ['tres-lineas-rojo', 'elipse-celeste'],

  ['cuatro-lineas-rojo', 'circulo-stroke-celeste'],
  ['circulo-stroke-bordo', 'semielipse-stroke-beige'],
  ['semielipse-stroke-celeste', 'elipse-rojo'],
  ['elipse-stroke-beige', 'circulo-bordo'],
  ['circulo-beige', 'tres-lineas-celeste'],

  ['tres-lineas-beige', 'elipse-stroke-rojo'],
  ['cuatro-lineas-beige', 'circulo-stroke-celeste'],
  ['elipse-stroke-celeste', 'semielipse-stroke-bordo'],
  ['semielipse-stroke-beige', 'cuatro-lineas-bordo'],
]

const COLS = 5

// Punteado de la grilla (como en el diseño de Figma)
const LINE_COLOR = '#9a9a9a'
const DASH = 12
const GAP = 9
const LINE_W = 1.5

const dashV = `repeating-linear-gradient(to bottom, ${LINE_COLOR} 0 ${DASH}px, transparent ${DASH}px ${DASH + GAP}px)`
const dashH = `repeating-linear-gradient(to right, ${LINE_COLOR} 0 ${DASH}px, transparent ${DASH}px ${DASH + GAP}px)`
const INNER = Array.from({ length: COLS - 1 }, (_, i) => ((i + 1) / COLS) * 100)

// Texto del mini brief (efecto máquina de escribir)
const TEXTO =
  'Una colección de objetos de diseño argentino diseñados en la segunda mitad del siglo XX, leída a través de la reducción progresiva de la forma hacia lo esencial.'

// Tiempos de la secuencia
const STAGGER = 28 // ms entre celdas al desvanecerse
const DUR_CELDA = 320 // ms de cada celda
const MS_SALIDA = (PAIRS.length - 1) * STAGGER + DUR_CELDA + 120 // total hasta pantalla en blanco
const MS_POR_LETRA = 24 // velocidad del typewriter

function Cell({ defaultShape, hoverShape, saliendo, delay }) {
  return (
    <div
      className={`group relative flex items-center justify-center overflow-hidden ${
        saliendo ? 'formas-out' : ''
      }`}
      style={saliendo ? { animationDelay: `${delay}ms` } : undefined}
    >
      {/* forma default */}
      <img
        src={shapes[defaultShape]}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute max-h-[55%] max-w-[55%] select-none object-contain group-hover:opacity-0"
      />
      {/* forma hover (corte directo, sin transición) */}
      <img
        src={shapes[hoverShape]}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute max-h-[55%] max-w-[55%] select-none object-contain opacity-0 group-hover:opacity-100"
      />
    </div>
  )
}

// Texto del brief con efecto máquina de escribir + botón "Ver colección".
// Aislado en su propio componente para que el re-render por cada letra NO
// re-renderice (ni reinicie la transición de) las celdas de la grilla.
function Brief({ texto, velocidad, onVerColeccion }) {
  const [n, setN] = useState(0)

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i += 1
      setN(i)
      if (i >= texto.length) clearInterval(id)
    }, velocidad)
    return () => clearInterval(id)
  }, [texto, velocidad])

  const listo = n >= texto.length

  return (
    <>
      <p className="absolute top-1/2 left-[50px] w-[min(1100px,75vw)] -translate-y-1/2 text-[32px] leading-[1.45] font-extralight text-depura-bordo italic">
        <span>{texto.slice(0, n)}</span>
        {!listo && <span className="caret-blink font-normal not-italic">|</span>}
        <span className="text-transparent">{texto.slice(n)}</span>
      </p>

      {/* Botón alineado al eje vertical del logo (columna inferior derecha) */}
      <button
        type="button"
        onClick={onVerColeccion}
        className={`absolute bottom-[17%] left-[90%] z-10 -translate-x-1/2 cursor-pointer rounded-full bg-depura-bordo px-8 py-3.5 text-base font-semibold whitespace-nowrap text-white shadow-[1px_1px_6px_rgba(0,0,0,0.3)] transition-opacity duration-500 ${
          listo ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        Ver colección
      </button>
    </>
  )
}

function LogoCell({ onClick, clickable }) {
  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      aria-label="DEPURA — comenzar"
      className={`relative flex items-center justify-center overflow-hidden ${
        clickable ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <img
        src={shapes['logo-rojo']}
        alt="DEPURA"
        className="pointer-events-none max-h-[45%] max-w-[70%] select-none object-contain"
      />
    </button>
  )
}

/**
 * Pantalla de inicio / toolkit. Grilla 5×5 de formas con hover. Al hacer click
 * en el logo de DEPURA, las formas se desvanecen escalonadamente hasta dejar la
 * pantalla en blanco, aparece el mini brief con efecto máquina de escribir y,
 * al terminar, un botón "Ver colección".
 *
 * @param {Function} onVerColeccion Se llama al hacer click en "Ver colección".
 */
export default function Toolkit({ onVerColeccion }) {
  const [fase, setFase] = useState('grilla') // 'grilla' | 'saliendo' | 'brief'

  const saliendo = fase === 'saliendo' || fase === 'brief'

  function comenzar() {
    setFase('saliendo')
    setTimeout(() => setFase('brief'), MS_SALIDA)
  }

  return (
    <div className="font-montserrat relative h-screen w-screen overflow-hidden bg-white">
      {/* Grilla (las formas se desvanecen; el logo permanece) */}
      <div className="grid h-full w-full grid-cols-5 grid-rows-5">
        {PAIRS.map(([def, hov], i) => (
          <Cell
            key={i}
            defaultShape={def}
            hoverShape={hov}
            saliendo={saliendo}
            delay={i * STAGGER}
          />
        ))}
        <LogoCell onClick={comenzar} clickable={fase === 'grilla'} />
      </div>

      {/* Líneas punteadas de la grilla (se desvanecen junto con las formas) */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ opacity: saliendo ? 0 : 1 }}
      >
        {INNER.map((pos) => (
          <div
            key={`v-${pos}`}
            className="absolute inset-y-0"
            style={{ left: `${pos}%`, width: `${LINE_W}px`, transform: 'translateX(-50%)', backgroundImage: dashV }}
          />
        ))}
        {INNER.map((pos) => (
          <div
            key={`h-${pos}`}
            className="absolute inset-x-0"
            style={{ top: `${pos}%`, height: `${LINE_W}px`, transform: 'translateY(-50%)', backgroundImage: dashH }}
          />
        ))}
      </div>

      {/* Mini brief: texto typewriter + botón (aislado para no re-renderizar la grilla) */}
      {fase === 'brief' && (
        <Brief texto={TEXTO} velocidad={MS_POR_LETRA} onVerColeccion={onVerColeccion} />
      )}
    </div>
  )
}
