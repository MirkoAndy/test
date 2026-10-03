/*
 * MIRROR MIRROR — configurazione del sito
 * ------------------------------------------------------------
 * Unico file da toccare per collegare Altegio.
 * Finché ALTEGIO.enabled è false, il pulsante "Prenota un appuntamento"
 * apre il pannello di cortesia (contatti diretti + richiesta via e-mail).
 *
 * Quando Altegio sarà attivo:
 *   Amministrazione → Online booking → Online booking links
 *   1. copiare il link della pagina di prenotazione  → bookingUrl
 *   2. copiare l'URL dello script del "Website button" → widgetScriptUrl
 *   3. scegliere la modalità (vedi sotto) e mettere enabled: true
 */
window.MM_CONFIG = {
  ALTEGIO: {
    enabled: false,

    // "widget"  → usa lo script ufficiale Altegio (overlay nativo sopra il sito)
    // "iframe"  → apre la pagina di prenotazione dentro il pannello Mirror Mirror
    // "link"    → apre la pagina di prenotazione in una nuova scheda
    mode: 'widget',

    // Pagina di prenotazione online, es. "https://n123456.alteg.io/"  [DA INSERIRE]
    bookingUrl: '',

    // Script del pulsante, es. "https://w123456.alteg.io/widgetJS"  [DA INSERIRE]
    widgetScriptUrl: '',

    // Collegamento diretto a un servizio o a una categoria.
    // {base} = bookingUrl, {id} = id del servizio in Altegio.
    // Formato da verificare sul link reale generato da Altegio.
    serviceUrlTemplate: '{base}?o=s{id}',

    // Id Altegio per ciascun Incantesimo (chiavi = data-service nel markup).  [DA INSERIRE]
    services: {
      viso: '',
      corpo: '',
      'mani-piedi': '',
      sguardo: ''
    },

    // Passa le UTM della pagina al link di prenotazione (per misurare le campagne)
    forwardUtm: true
  },

  // Contatti mostrati quando la prenotazione online non è ancora attiva  [DA INSERIRE]
  CONTACTS: {
    phone: '',          // es. "+39 02 0000 0000"
    whatsapp: '',       // es. "390200000000" (solo cifre, con prefisso)
    email: '',          // es. "corte@mirrormirror.it"
    address: 'Corso di Porta Romana 106, 20122 Milano',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Corso+di+Porta+Romana+106+Milano'
  }
};
