import { useMemo, useState } from 'react'

// Sentinelas de color en los SVG de los objetos (convención DEPURA):
//   #DB1B00 → cuerpo principal (toma el color elegido)
//   #64C6F7 → elementos de detalle (rayitas, rectángulo interno): toman un color
//             de CONTRASTE calculado, para que nunca se mimeticen con el principal.
// Se reemplazan por variables CSS (var()) que se setean en el wrapper del objeto.
const COLOR_DEFECTO = '#DB1B00'

// Colores oscuros de la paleta. Si el principal es oscuro, el detalle va claro;
// si el principal es claro, el detalle va oscuro. Así el contraste está garantizado.
const COLORES_OSCUROS = new Set(['#761717', '#DB1B00']) // bordó, rojo
const DETALLE_SOBRE_OSCURO = '#65C6F7' // celeste (claro)
const DETALLE_SOBRE_CLARO = '#761717' // bordó (oscuro)

function colorDetalle(principalHex) {
  return COLORES_OSCUROS.has(principalHex.toUpperCase())
    ? DETALLE_SOBRE_OSCURO
    : DETALLE_SOBRE_CLARO
}

// Primitivas del lenguaje del toolkit para el panel "Las formas que se usaron".
const FORMAS_PRIMITIVAS = {
  semicirculo: {
    label: 'Semicírculo',
    svg: (
      <svg viewBox="0 0 64 32" className="h-full w-full" aria-hidden="true">
        <path d="M0 32A32 32 0 0 1 64 32Z" fill="currentColor" />
      </svg>
    ),
  },
  rectangulo: {
    label: 'Rectángulo',
    svg: (
      <svg viewBox="0 0 40 56" className="h-full w-full" aria-hidden="true">
        <rect width="40" height="56" fill="currentColor" />
      </svg>
    ),
  },
}

// QR de ejemplo (placeholder determinístico a partir de la config). No es un QR
// real: sólo simula la estética para ver la estructura del souvenir.
function FakeQR({ value = '', size = 160 }) {
  const n = 21
  let seed = 2166136261
  for (let i = 0; i < value.length; i++) seed = (seed ^ value.charCodeAt(i)) * 16777619
  const rand = (i) => {
    let x = (seed ^ (i * 2654435761)) >>> 0
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return ((x >>> 0) % 1000) / 1000
  }
  const finderFilled = (r, c) => {
    const boxes = [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ]
    for (const [br, bc] of boxes) {
      const rr = r - br
      const cc = c - bc
      if (rr < 0 || rr > 6 || cc < 0 || cc > 6) continue
      const onBorder = rr === 0 || rr === 6 || cc === 0 || cc === 6
      const center = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4
      return onBorder || center
    }
    return null // no es zona de finder
  }
  const cells = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const f = finderFilled(r, c)
      const filled = f !== null ? f : rand(r * n + c) > 0.52
      if (filled) cells.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" />)
    }
  }
  return (
    <svg
      viewBox={`-1 -1 ${n + 2} ${n + 2}`}
      width={size}
      height={size}
      role="img"
      aria-label="Código QR de ejemplo"
      fill="#761717"
    >
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="white" />
      {cells}
    </svg>
  )
}

/**
 * Detalle de un objeto de la colección DEPURA.
 *
 * Reutilizable: recibe los datos del objeto por props para poder alimentarlo
 * con cualquier objeto sin rehacer el layout.
 *
 * @param {string}   nombre   Nombre del objeto (ej. "Magiclick").
 * @param {string[]} niveles  Niveles de síntesis como strings SVG, de menor a
 *                            mayor síntesis (nivel 1 … nivel N).
 * @param {{nombre:string,hex:string}[]} colores Colores disponibles.
 * @param {string[]} formas   Claves de FORMAS_PRIMITIVAS usadas en la síntesis.
 */
export default function ObjectDetail({ nombre, niveles, colores, formas, onInicio }) {
  const totalNiveles = niveles.length

  const [nivel, setNivel] = useState(1) // 1 … totalNiveles
  const [color, setColor] = useState(COLOR_DEFECTO)
  const [souvenirAbierto, setSouvenirAbierto] = useState(false)

  // Reemplaza los sentinelas por variables CSS (una sola vez por set de niveles).
  // var() no funciona en atributos de presentación, pero sí dentro de `style`.
  const nivelesProcesados = useMemo(
    () =>
      niveles.map((svg) =>
        svg
          .replace(/fill="#DB1B00"/gi, 'style="fill:var(--obj-main)"')
          .replace(/fill="#64C6F7"/gi, 'style="fill:var(--obj-detail)"'),
      ),
    [niveles],
  )

  const svgActual = nivelesProcesados[nivel - 1]
  const enNivelFinal = nivel === totalNiveles

  const nombreColor =
    colores.find((c) => c.hex.toLowerCase() === color.toLowerCase())?.nombre ?? color
  const formasUsadas = formas
    .map((f) => FORMAS_PRIMITIVAS[f]?.label)
    .filter(Boolean)

  return (
    <div className="font-montserrat relative h-screen w-screen overflow-hidden bg-white text-depura-bordo">
      {/* Fondo gris circular detrás del objeto (sale por la derecha). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-[40%] aspect-square h-[150vh] -translate-y-1/2 rounded-full bg-[#f1f0ee]"
      />

      {/* Objeto — cambia de forma de manera INSTANTÁNEA (sin transición) al
          mover el slider de síntesis. Cuerpo = --obj-main, detalle = --obj-detail.
          El nivel 1 (foto real) es más ancho que los niveles sintetizados, así que
          se corre a la derecha para no quedar pegado al borde del círculo. */}
      <div
        className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ left: nivel === 1 ? '62%' : '54%' }}
      >
        <div
          className="flex h-[74vh] items-center justify-center [&>svg]:h-full [&>svg]:w-auto"
          style={{ '--obj-main': color, '--obj-detail': colorDetalle(color) }}
          dangerouslySetInnerHTML={{ __html: svgActual }}
        />
      </div>

      {/* Barra lateral de controles */}
      <aside className="absolute inset-y-0 left-0 flex w-[440px] flex-col py-12 pr-[40px] pl-[130px]">
        {/* Inicio */}
        <button
          type="button"
          onClick={onInicio}
          className="cursor-pointer self-start rounded-full bg-depura-beige px-4 py-1 text-sm text-depura-bordo"
        >
          Inicio
        </button>

        <div className="mt-[14vh] flex flex-col gap-12">
          {/* 1 · Sintetizar */}
          <section>
            <h2 className="mb-4 text-2xl">Sintetizar</h2>
            <input
              type="range"
              min={1}
              max={totalNiveles}
              step={1}
              value={nivel}
              onChange={(e) => setNivel(Number(e.target.value))}
              className="depura-slider block"
              aria-label="Nivel de síntesis"
            />
            <p className="mt-3 text-sm text-depura-bordo/70">
              Nivel {nivel} de {totalNiveles}
            </p>
          </section>

          {/* 2 · Color */}
          <section>
            <h2 className="mb-4 text-2xl">Color</h2>
            <div className="flex gap-[23px]">
              {colores.map((c) => {
                const activo = color.toLowerCase() === c.hex.toLowerCase()
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    title={c.nombre}
                    aria-label={c.nombre}
                    aria-pressed={activo}
                    className={`size-[37px] cursor-pointer shadow-[1px_1px_4px_rgba(0,0,0,0.25)] ${
                      activo ? 'outline outline-2 outline-offset-2 outline-depura-bordo' : ''
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                )
              })}
            </div>
          </section>
        </div>

        {/* Panel "Las formas que se usaron" — oculto, aparece con fade SOLO
            cuando la síntesis llega al nivel final. */}
        <section
          aria-hidden={!enNivelFinal}
          className={`mt-auto transition-opacity duration-500 ${
            enNivelFinal ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <h2 className="mb-4 text-lg">Las formas que se usaron</h2>
          <div className="flex items-end gap-8" style={{ color }}>
            {formas.map((f) => {
              const prim = FORMAS_PRIMITIVAS[f]
              if (!prim) return null
              return (
                <div key={f} className="flex flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-end justify-center">{prim.svg}</div>
                  <span className="text-xs text-depura-bordo">{prim.label}</span>
                </div>
              )
            })}
          </div>
        </section>
      </aside>

      {/* Acción principal de cierre — aparece (fade) junto con el panel de
          formas, sólo en el nivel final. Esquina inferior derecha. */}
      <button
        type="button"
        onClick={() => setSouvenirAbierto(true)}
        aria-hidden={!enNivelFinal}
        className={`fixed right-12 bottom-10 z-20 cursor-pointer rounded-full bg-depura-bordo px-8 py-3.5 text-base font-semibold text-white shadow-[1px_1px_6px_rgba(0,0,0,0.3)] transition-opacity duration-500 ${
          enNivelFinal ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        Generar souvenir
      </button>

      {/* Placeholder del souvenir (modal). La generación real se desarrolla luego. */}
      {souvenirAbierto && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-6"
          onClick={() => setSouvenirAbierto(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Generar souvenir"
        >
          <div
            className="w-[420px] max-w-full rounded-2xl bg-white p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-depura-bordo">Generando tu souvenir…</h2>

            <div className="mt-6 flex justify-center">
              <FakeQR value={`${nombre}|${nombreColor}|${formasUsadas.join(',')}`} />
            </div>

            <dl className="mt-6 space-y-1 text-left text-sm text-depura-bordo">
              <div className="flex gap-2">
                <dt className="font-semibold">Objeto:</dt>
                <dd>{nombre}</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="font-semibold">Color:</dt>
                <dd className="flex items-center gap-2">
                  <span
                    className="inline-block size-4 rounded-sm ring-1 ring-black/10"
                    style={{ backgroundColor: color }}
                  />
                  {nombreColor}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Formas usadas:</dt>
                <dd>{formasUsadas.join(' + ')}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => setSouvenirAbierto(false)}
              className="mt-7 cursor-pointer rounded-full bg-depura-beige px-5 py-2 text-sm font-medium text-depura-bordo"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <span className="sr-only">{nombre}</span>
    </div>
  )
}
