// Los 15 objetos de la colección DEPURA. Cada uno es la puerta de entrada al
// juego de depuración (pantalla de detalle) de ese objeto.
//
// El campo `imagen` es el nombre de archivo dentro de
// src/assets/objetos/coleccion/. Abajo se resuelve a una URL (`imagenUrl`)
// usando import.meta.glob, así no hay que importar cada imagen a mano.

const imagenes = import.meta.glob('../assets/objetos/coleccion/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})

function urlDe(nombreArchivo) {
  const entrada = Object.entries(imagenes).find(([ruta]) => ruta.endsWith('/' + nombreArchivo))
  return entrada?.[1]
}

const registros = [
  {
    id: 'magiclick',
    nombre: 'Magiclick',
    disenador: 'Hugo Kogan',
    anio: '1963',
    material: 'Plástico moldeado y componentes electrónicos',
    imagen: 'magiclick.png',
  },
  {
    id: 'calculadora-cifra',
    nombre: 'Calculadora Cifra',
    disenador: 'Silvio Grichener',
    anio: '1973',
    material: 'Plástico, circuito electrónico, pantalla de tubo',
    imagen: 'calculadora-cifra.png',
  },
  {
    id: 'radio-giulia',
    nombre: 'Radio Giulia',
    disenador: 'Roberto Napoli',
    anio: '1975',
    material: 'Plástico moldeado y metal',
    imagen: 'radio-giulia.png',
  },
  {
    id: 'mobiliario-escolar',
    nombre: 'Mobiliario escolar',
    disenador: 'Ricardo Blanco',
    anio: '1979 - 1982',
    material: 'Madera, metal y plástico',
    imagen: 'mobiliario-escolar.png',
  },
  {
    id: 'silla-plaka',
    nombre: 'Silla Plaka',
    disenador: 'Ricardo Blanco',
    anio: '1972',
    material: 'Madera enchapada pintada',
    imagen: 'silla-plaka.png',
  },
  {
    id: 'cubiertos-orfeo',
    nombre: 'Cubiertos Orfeo',
    disenador: 'Orfeo',
    anio: '1960',
    material: 'Acero inoxidable',
    imagen: 'cubiertos-orfeo.png',
  },
  {
    id: 'sillon-basico',
    nombre: 'Sillón Básico',
    disenador: 'Margarita Paksa',
    anio: '1968',
    material: 'Acrílico',
    imagen: 'sillon-basico.png',
  },
  {
    id: 'linterna-pop',
    nombre: 'Linterna Pop',
    disenador: 'Hugo Kogan',
    anio: '1960s',
    material: 'Plástico y metal',
    imagen: 'linterna-pop.png',
  },
  {
    id: 'vajilla-mesa',
    nombre: 'Vajilla de mesa',
    disenador: 'Ariel Scornik',
    anio: '1972',
    material: 'Chapa repujada y enlozada',
    imagen: 'vajilla-mesa.png',
  },
  {
    id: 'sillon-cinta',
    nombre: 'Sillón Cinta',
    disenador: 'Alberto Churba',
    anio: '1968',
    material: 'Madera multilaminada laqueada',
    imagen: 'sillon-cinta.png',
  },
  {
    id: 'banqueta-alta',
    nombre: 'Banqueta Alta',
    disenador: 'Jorge Parsons',
    anio: '1963',
    material: 'Madera y metal',
    imagen: 'banqueta-alta.png',
  },
  {
    id: 'silla-trigamba',
    nombre: 'Silla Trigamba',
    disenador: 'Ricardo Blanco',
    anio: '1980',
    material: 'Madera y hierro',
    imagen: 'silla-trigamba.png',
  },
  {
    id: 'lampara-olympia',
    nombre: 'Lámpara Olympia',
    disenador: 'Jorge Pensi',
    anio: '1980s',
    material: 'Aluminio y acrílico',
    imagen: 'lampara-olympia.png',
  },
  {
    id: 'licuadora-aurora',
    nombre: 'Licuadora Aurora',
    disenador: 'Aurora',
    anio: '1980',
    material: 'Plástico moldeado por inyección',
    imagen: 'licuadora-aurora.png',
  },
  {
    id: 'televisor-micro',
    nombre: 'Televisor Micro',
    disenador: 'Roberto Napoli',
    anio: '1975',
    material: 'Plástico, metal y componentes electrónicos',
    imagen: 'televisor-micro.png',
  },
]

export const objetos = registros.map((o) => ({ ...o, imagenUrl: urlDe(o.imagen) }))

export default objetos
