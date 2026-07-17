import { useEffect, useRef, useState } from 'react'
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
const MS_MIN = 15 // intervalo mínimo entre celdas tapadas (ms)
const MS_MAX = 20 // intervalo máximo entre celdas tapadas (ms)

// Orden aleatorio (Fisher–Yates) de los índices 0..n-1.
function ordenAleatorio(n) {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function Cell({ defaultShape, hoverShape, cubierta }) {
  return (
    <div className="group relative flex items-center justify-center overflow-hidden">
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
      {/* Cuadrado bordó que tapa la celda entera (instantáneo, sin transición) */}
      {cubierta && <span className="absolute inset-0 bg-depura-bordo" />}
    </div>
  )
}

// Texto curatorial del brief + botón "Ver colección". Aparece todo de una,
// con un fade-in rápido (sin efecto máquina de escribir).
function Brief({ texto, onVerColeccion }) {
  return (
    <>
      <p className="brief-in absolute top-1/2 left-[50px] w-[min(1200px,80vw)] -translate-y-1/2 text-[40px] leading-[1.45] font-extralight text-white italic">
        {texto}
      </p>

      {/* Botón rectangular rojo con borde blanco. Alineado a la izquierda con el
          texto (left 50px) y a la altura del logo DEPURA (centro vertical ~90%). */}
      <button
        type="button"
        onClick={onVerColeccion}
        className="brief-in absolute top-[90%] left-[50px] z-10 -translate-y-1/2 cursor-pointer border-2 border-white bg-depura-rojo px-8 py-3 text-[19px] font-bold whitespace-nowrap text-white uppercase"
      >
        Ver colección
      </button>
    </>
  )
}

// La celda del logo NUNCA se cubre: el wordmark queda visible en todo momento.
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
  const [cubiertas, setCubiertas] = useState(() => Array(PAIRS.length).fill(false))
  const timeoutsRef = useRef([])

  // Garantiza que al montar (recarga, hot-reload o restauración de bfcache)
  // TODAS las formas arranquen visibles y en la fase inicial: nunca queda
  // estado "desaparecido" guardado entre renders. Al desmontar, limpia timers.
  useEffect(() => {
    setFase('grilla')
    setCubiertas(Array(PAIRS.length).fill(false))
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [])

  // Al hacer click en DEPURA: cada celda con forma se tapa con un cuadrado bordó
  // del tamaño exacto de la celda, en orden aleatorio y con 15-20ms entre cada
  // una. La celda del logo queda afuera (el wordmark sigue visible), igual que
  // la grilla punteada, que se pinta por encima. Al taparse la última arranca el
  // brief (fase 'brief'), que usa el mismo bordó → sin corte visible.
  function comenzar() {
    setFase('saliendo')
    const orden = ordenAleatorio(PAIRS.length)
    let k = 0
    const paso = () => {
      const idx = orden[k] // capturar el índice AHORA (el updater corre async)
      setCubiertas((prev) => {
        const next = [...prev]
        next[idx] = true
        return next
      })
      k += 1
      if (k < orden.length) {
        timeoutsRef.current.push(setTimeout(paso, MS_MIN + Math.random() * (MS_MAX - MS_MIN)))
      } else {
        setFase('brief')
      }
    }
    timeoutsRef.current.push(setTimeout(paso, MS_MIN + Math.random() * (MS_MAX - MS_MIN)))
  }

  return (
    <div
      className={`font-montserrat relative h-screen w-screen overflow-hidden transition-colors duration-200 ${
        fase === 'brief' ? 'bg-depura-bordo' : 'bg-white'
      }`}
    >
      {/* Grilla — cada celda se va tapando con un cuadrado bordó en orden aleatorio */}
      <div className="grid h-full w-full grid-cols-5 grid-rows-5">
        {PAIRS.map(([def, hov], i) => (
          <Cell key={i} defaultShape={def} hoverShape={hov} cubierta={cubiertas[i]} />
        ))}
        <LogoCell onClick={comenzar} clickable={fase === 'grilla'} />
      </div>

      {/* Líneas punteadas de la grilla: visibles siempre (antes, durante y
          durante la transición de celdas). Al venir después de la grilla en el
          DOM y ser todas z-auto, se pintan por encima de los cuadrados bordó.
          Se desmontan al entrar el brief: corte instantáneo, sin fade. */}
      {fase !== 'brief' && (
        <div className="pointer-events-none absolute inset-0">
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
      )}

      {/* Mini brief: texto curatorial + botón */}
      {fase === 'brief' && <Brief texto={TEXTO} onVerColeccion={onVerColeccion} />}
    </div>
  )
}
