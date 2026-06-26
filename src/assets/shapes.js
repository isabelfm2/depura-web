// Importa todas las figuras SVG de DEPURA como URLs listas para usar en <img>.
// Acceso por nombre: shapes['circulo-bordo'], o por colección agrupada.
const modules = import.meta.glob('./shapes/*.svg', { eager: true, query: '?url', import: 'default' })

export const shapes = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => {
    const name = path.split('/').pop().replace('.svg', '')
    return [name, url]
  }),
)

export default shapes
