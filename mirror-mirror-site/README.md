# Mirror Mirror — sito

Sito statico (HTML, CSS, JS, nessuna build), costruito sul Manuale di stile Ed. 02.
Si pubblica così com'è su qualsiasi hosting: Netlify, Vercel, GitHub Pages, un server Apache/Nginx.

```
index.html
assets/css/style.css     palette, tipografia, layout, responsive
assets/js/config.js      ← l'unico file da modificare per Altegio e contatti
assets/js/booking.js     logica dei pulsanti di prenotazione
assets/js/main.js        header, menu mobile, comparse
assets/img/              logo, monogramma, (hero.jpg facoltativa)
```

Per provarlo in locale: `npx serve mirror-mirror-site` oppure aprire `index.html`.

## Prenotazioni con Altegio

Ogni elemento con `data-book` è un pulsante di prenotazione. Il pulsante "Prenota un appuntamento" compare
in hero, header, menu mobile, barra fissa su smartphone e chiusura di pagina.
Ogni Incantesimo ha il suo pulsante con `data-service="viso|corpo|mani-piedi|sguardo"`.

**Oggi** (`enabled: false`) i pulsanti aprono un pannello di cortesia con WhatsApp, telefono ed e-mail.
I contatti vanno inseriti in `CONTACTS` dentro `config.js`. Finché sono vuoti il pannello lo segnala.

**Quando Altegio è attivo**: Amministrazione → Online booking → Online booking links.

1. Copiare il link della pagina di prenotazione in `bookingUrl`.
2. Copiare l'URL dello script del "Website button" in `widgetScriptUrl`.
3. Scegliere la modalità `mode`:
   - `widget`: overlay ufficiale Altegio sopra il sito (consigliata). Lo script viene caricato in automatico e
     si aggancia ai pulsanti tramite classe `ms_booking` e attributo `data-url`. Verificare questi due nomi
     con il codice "custom button" fornito da Altegio e, se diversi, aggiornarli in `booking.js` (`prepareWidget`).
   - `iframe`: la pagina Altegio si apre dentro il pannello laterale Mirror Mirror.
   - `link`: apre la pagina Altegio in una nuova scheda.
4. Facoltativo: inserire gli id dei servizi in `services` per far atterrare ogni Incantesimo sul servizio giusto.
   Il formato del link (`serviceUrlTemplate`) va verificato su un link reale generato da Altegio.
5. Mettere `enabled: true`.

Le UTM della pagina vengono passate al link di prenotazione (`forwardUtm`). Ogni apertura emette
l'evento `mm:booking-open` e un `dataLayer.push({ event: "booking_open" })` per Google Tag Manager / GA4.

## Da completare

- Foto dell'hero: salvare `assets/img/hero.jpg` (verticale, scura, secondo la direzione fotografica).
  Senza foto lo specchio mostra l'incisione *Mirror, mirror on the wall…*
- Orari, contatti, link Privacy / Cookie / Instagram (segnati tra parentesi quadre o `#`).
- Banner cookie e informativa: necessari se si attivano analytics o il widget Altegio (cookie di terze parti).
