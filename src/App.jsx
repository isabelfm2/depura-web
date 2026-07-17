import { useState } from 'react'
import Toolkit from './components/Toolkit.jsx'
import Collection from './components/Collection.jsx'
import ObjectDetail from './components/ObjectDetail.jsx'
import { objetos } from './data/objetos.js'
import { magiclick } from './assets/objetos/magiclick.js'
import { calculadora } from './assets/objetos/calculadora.js'
import {
  licuadora,
  radio,
  televisor,
  cubiertos,
  vajilla,
  sillonBasico,
  sillaPlaka,
  sillaTrigamba,
  linterna,
  sillonCinta,
  mobiliarioEscolar,
  banquetaAlta,
  lamparaOlympia,
} from './assets/objetos/objetos-detalle.js'

// Registro de datos de detalle por id. Se van sumando objetos con su módulo de datos.
const DETALLES = {
  magiclick,
  'calculadora-cifra': calculadora,
  'licuadora-aurora': licuadora,
  'radio-giulia': radio,
  'televisor-micro': televisor,
  'cubiertos-orfeo': cubiertos,
  'vajilla-mesa': vajilla,
  'sillon-basico': sillonBasico,
  'silla-plaka': sillaPlaka,
  'silla-trigamba': sillaTrigamba,
  'linterna-pop': linterna,
  'sillon-cinta': sillonCinta,
  'mobiliario-escolar': mobiliarioEscolar,
  'banqueta-alta': banquetaAlta,
  'lampara-olympia': lamparaOlympia,
}

const MS_SLIDE = 700 // duración del slide-up Toolkit → Colección

export default function App() {
  // 'inicio' = Toolkit (menú + brief) · 'coleccion' = grilla · <id> = detalle
  const [vista, setVista] = useState('inicio')
  const [deslizando, setDeslizando] = useState(false) // slide-up en curso

  // Toolkit → Colección: la pantalla actual sube y la Colección entra desde abajo.
  function irAColeccion() {
    setDeslizando(true)
    setTimeout(() => {
      setVista('coleccion')
      setDeslizando(false)
    }, MS_SLIDE)
  }

  if (vista === 'inicio') {
    // Ambas pantallas montadas; el slide anima el translateY de las dos capas.
    return (
      <div className="relative h-screen w-screen overflow-hidden">
        <div
          className="absolute inset-0 z-20 transition-transform ease-in-out"
          style={{
            transitionDuration: `${MS_SLIDE}ms`,
            transform: deslizando ? 'translateY(-100%)' : 'translateY(0)',
          }}
        >
          <Toolkit onVerColeccion={irAColeccion} />
        </div>
        <div
          className="absolute inset-0 z-10 transition-transform ease-in-out"
          style={{
            transitionDuration: `${MS_SLIDE}ms`,
            transform: deslizando ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          <Collection objetos={objetos} onSelect={setVista} onInicio={() => setVista('inicio')} />
        </div>
      </div>
    )
  }

  if (vista === 'coleccion') {
    return (
      <Collection objetos={objetos} onSelect={setVista} onInicio={() => setVista('inicio')} />
    )
  }

  // vista === id de un objeto → pantalla de detalle / juego de depuración
  const detalle = DETALLES[vista]
  if (detalle) {
    return <ObjectDetail {...detalle} onInicio={() => setVista('coleccion')} />
  }

  // Objeto todavía no conectado: placeholder con vuelta a la Colección.
  const meta = objetos.find((o) => o.id === vista)
  return (
    <div className="font-montserrat flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-white px-6 text-center text-depura-bordo">
      <h1 className="text-3xl font-bold">{meta?.nombre}</h1>
      <p className="max-w-md text-gray-500">
        El juego de depuración de este objeto todavía está en construcción.
      </p>
      <button
        type="button"
        onClick={() => setVista('coleccion')}
        className="cursor-pointer rounded-full bg-depura-bordo px-6 py-2.5 text-sm font-semibold text-white"
      >
        Volver a la Colección
      </button>
    </div>
  )
}
