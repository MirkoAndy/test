/*
 * MIRROR MIRROR — modulo prenotazioni
 * Tutti gli elementi con [data-book] aprono la prenotazione.
 * data-service="viso" (facoltativo) porta direttamente al servizio.
 *
 * Eventi emessi (per analytics / tag manager):
 *   window "mm:booking-open"  detail: { service, source, mode }
 *   dataLayer.push({ event: "booking_open", ... })
 */
(function () {
  'use strict';

  var cfg = (window.MM_CONFIG && window.MM_CONFIG.ALTEGIO) || {};
  var contacts = (window.MM_CONFIG && window.MM_CONFIG.CONTACTS) || {};
  var live = !!(cfg.enabled && cfg.bookingUrl);
  var dialog = document.getElementById('booking');
  var lastTrigger = null;

  function withUtm(url) {
    if (!cfg.forwardUtm || !url) return url;
    try {
      var page = new URL(window.location.href);
      var target = new URL(url, window.location.href);
      page.searchParams.forEach(function (v, k) {
        if (k.indexOf('utm_') === 0 && !target.searchParams.has(k)) target.searchParams.set(k, v);
      });
      return target.toString();
    } catch (e) { return url; }
  }

  function urlFor(service) {
    var id = service && cfg.services ? cfg.services[service] : '';
    if (!id) return withUtm(cfg.bookingUrl);
    return withUtm((cfg.serviceUrlTemplate || '{base}')
      .replace('{base}', cfg.bookingUrl)
      .replace('{id}', encodeURIComponent(id)));
  }

  function track(service, source, mode) {
    var detail = { service: service || null, source: source || null, mode: mode };
    window.dispatchEvent(new CustomEvent('mm:booking-open', { detail: detail }));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'booking_open', booking_service: detail.service, booking_source: detail.source, booking_mode: mode });
  }

  /* ---------- Modalità "widget": script ufficiale Altegio ---------- */
  function prepareWidget() {
    if (!live || cfg.mode !== 'widget' || !cfg.widgetScriptUrl) return false;
    // Il widget Altegio si aggancia ai link con classe "ms_booking" e attributo data-url.
    document.querySelectorAll('[data-book]').forEach(function (el) {
      el.classList.add('ms_booking');
      el.setAttribute('data-url', urlFor(el.getAttribute('data-service')));
    });
    var s = document.createElement('script');
    s.src = cfg.widgetScriptUrl;
    s.charset = 'UTF-8';
    s.async = true;
    document.body.appendChild(s);
    return true;
  }

  /* ---------- Pannello Mirror Mirror (iframe o cortesia) ---------- */
  function fillPanel(service) {
    var frameWrap = dialog.querySelector('[data-panel="frame"]');
    var soonWrap = dialog.querySelector('[data-panel="soon"]');
    if (live && cfg.mode === 'iframe') {
      frameWrap.hidden = false; soonWrap.hidden = true;
      var iframe = frameWrap.querySelector('iframe');
      var src = urlFor(service);
      if (iframe.getAttribute('src') !== src) iframe.setAttribute('src', src);
    } else {
      frameWrap.hidden = true; soonWrap.hidden = false;
      var label = service ? (document.querySelector('[data-service-name="' + service + '"]') || {}).textContent : '';
      var subject = 'Richiesta appuntamento' + (label ? ' — ' + label.trim() : '');
      var mail = dialog.querySelector('[data-contact="email"]');
      var tel = dialog.querySelector('[data-contact="phone"]');
      var wa = dialog.querySelector('[data-contact="whatsapp"]');
      toggleContact(mail, contacts.email, 'mailto:' + contacts.email + '?subject=' + encodeURIComponent(subject));
      toggleContact(tel, contacts.phone, 'tel:' + (contacts.phone || '').replace(/\s+/g, ''));
      toggleContact(wa, contacts.whatsapp, 'https://wa.me/' + contacts.whatsapp + '?text=' + encodeURIComponent(subject));
      var chosen = dialog.querySelector('[data-chosen]');
      chosen.textContent = label ? label.trim() : '';
      chosen.hidden = !label;
    }
  }

  function toggleContact(el, value, href) {
    if (!el) return;
    el.hidden = !value;
    if (value) el.setAttribute('href', href);
  }

  function openPanel(service, trigger) {
    lastTrigger = trigger || null;
    fillPanel(service);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.documentElement.classList.add('is-locked');
  }

  function closePanel() {
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('is-locked');
    if (lastTrigger) lastTrigger.focus();
  });
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog || e.target.closest('[data-close]')) closePanel();
  });

  var widgetReady = prepareWidget();

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-book]');
    if (!el) return;
    var service = el.getAttribute('data-service');
    var source = el.getAttribute('data-source');
    if (widgetReady) { track(service, source, 'widget'); return; } // lo gestisce lo script Altegio
    e.preventDefault();
    if (live && cfg.mode === 'link') {
      track(service, source, 'link');
      window.open(urlFor(service), '_blank', 'noopener');
      return;
    }
    track(service, source, live ? 'iframe' : 'soon');
    openPanel(service, el);
  });

  document.documentElement.setAttribute('data-booking', live ? cfg.mode : 'soon');
})();
