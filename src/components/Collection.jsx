import { useMemo, useState } from 'react'

// Una celda de la colección: círculo de fondo + foto del objeto + ventana de
// info al costado. En hover (desktop) el círculo pasa a celeste, la foto crece
// sobresaliendo del borde y aparece la ventana de info. En touch, el primer tap
// activa ese estado y el segundo (o el botón "Depurar") navega al juego.
function ItemColeccion({ obj, activo, onActivar, onTap, flip, canHover }) {
  return (
    <div
      className="group relative aspect-square"
      onMouseEnter={canHover ? () => onActivar(obj.id) : undefined}
      onMouseLeave={canHover ? () => onActivar(null) : undefined}
    >
      <button
        type="button"
        onClick={() => onTap(obj.id)}
        aria-label={obj.nombre}
        className="absolute inset-0 cursor-pointer"
      >
        {/* Círculo de fondo (beige → celeste en hover/activo) */}
        <span
          className={`absolute inset-[6%] rounded-full transition-colors duration-200 ${
            activo ? 'bg-depura-celeste' : 'bg-depura-beige'
          }`}
        />
        {/* Foto del objeto: crece y sobresale del círculo al activarse */}
        <img
          src={obj.imagenUrl}
          alt={obj.nombre}
          className={`pointer-events-none absolute inset-[15%] z-10 size-[70%] object-contain transition-transform duration-200 ${
            activo ? 'scale-[1.18]' : 'scale-100'
          }`}
        />
      </button>

      {/* Ventana de info — fade-in rápido (~0.2s). Se voltea al otro lado en las
          últimas columnas para no salirse de la pantalla. */}
      <div
        aria-hidden={!activo}
        className={`absolute top-1/2 z-20 w-56 -translate-y-1/2 rounded-xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5 transition-opacity duration-200 ${
          flip ? 'right-full mr-3 text-right' : 'left-full ml-3'
        } ${activo ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <p className="text-2xl leading-tight font-bold text-depura-bordo">{obj.nombre}</p>
        <p className="mt-1 text-base text-depura-bordo">
          {obj.disenador} · {obj.anio}
        </p>
        <p className="mt-1 text-xs text-gray-500">{obj.material}</p>
      </div>
    </div>
  )
}

/**
 * Pantalla "Colección": grilla de los objetos de DEPURA. Cada círculo es la
 * puerta de entrada al juego de depuración de ese objeto.
 *
 * @param {Array}    objetos  Registros de src/data/objetos.js (con imagenUrl).
 * @param {Function} onSelect Llamada con el id del objeto al navegar al detalle.
 */
export default function Collection({ objetos, onSelect, onInicio }) {
  const [activeId, setActiveId] = useState(null)
  const canHover = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches,
    [],
  )

  // En desktop el click navega directo. En touch, primer tap = mostrar info,
  // segundo tap sobre el mismo = navegar.
  function handleTap(id) {
    if (canHover) {
      onSelect(id)
      return
    }
    if (activeId === id) onSelect(id)
    else setActiveId(id)
  }

  return (
    <div className="font-montserrat min-h-screen w-full bg-white px-[5%] py-10 text-depura-bordo">
      <div className="mb-10 flex items-center gap-5">
        {onInicio && (
          <button
            type="button"
            onClick={onInicio}
            className="cursor-pointer rounded-full bg-depura-beige px-4 py-1 text-sm text-depura-bordo"
          >
            ← Inicio
          </button>
        )}
        <h1 className="text-2xl font-medium tracking-wide">COLECCIÓN</h1>
      </div>

      <div className="mx-auto grid max-w-[1500px] grid-cols-5 gap-x-12 gap-y-14">
        {objetos.map((obj, i) => (
          <ItemColeccion
            key={obj.id}
            obj={obj}
            activo={activeId === obj.id}
            onActivar={setActiveId}
            onTap={handleTap}
            flip={i % 5 >= 3}
            canHover={canHover}
          />
        ))}
      </div>
    </div>
  )
}
