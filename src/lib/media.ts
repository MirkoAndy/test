/** Genera un'immagine segnaposto SVG (data URI) con emoji su gradiente. */
export function fotoPlaceholder(emoji: string, colA: string, colB: string, etichetta = ''): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${colA}'/><stop offset='1' stop-color='${colB}'/>` +
    `</linearGradient></defs>` +
    `<rect width='640' height='420' fill='url(#g)'/>` +
    `<text x='320' y='235' font-size='130' text-anchor='middle'>${emoji}</text>` +
    (etichetta
      ? `<text x='320' y='340' font-size='28' text-anchor='middle' fill='rgba(255,255,255,0.9)' font-family='-apple-system, sans-serif'>${etichetta}</text>`
      : '') +
    `</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}
