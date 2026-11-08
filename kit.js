/* Terra's widget kit: what a book's widgets (web components in its widgets/<name>.js) share. The
   segmented control (real buttons with aria-pressed, updated in place so focus stays) and the readout
   row; the slider; a linear scale and a horizontal axis for SVG charts; the seeded random numbers and
   the normal quantile; the widget frame (title, status, how to use); and fill, which puts numbers
   into a phrase from the block's words. Moved verbatim from the EPI-II reading's app.js on 6 October
   2026 (the reading's own data went to that book's widgets/data.js); fill, slider, linear and axis
   added on 7 October, from what the reading's widgets had each written by hand. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pct1 = x => (x * 100).toFixed(1) + '%';
  function seg(host, opts, value, onChange, label) {
    host.innerHTML = ''; host.setAttribute('role', 'group'); if (label) host.setAttribute('aria-label', label);
    opts.forEach(o => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = o.label; b.dataset.v = o.value;
      b.setAttribute('aria-pressed', String(o.value === value));
      b.addEventListener('click', () => { set(o.value); onChange(o.value); });
      host.appendChild(b);
    });
    function set(v) { $$('button', host).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v))); }
    return { set };
  }
  // a labelled slider with its value shown beside it: ids prefix-key (the input) and prefix-key-o (the output)
  function slider(prefix, key, o) {
    const i = esc(prefix) + '-' + esc(key);
    return '<label class="terra-slider" for="' + i + '"><span>' + esc(o.label) + '</span><input id="' + i + '" type="range" min="' + esc(o.min) + '" max="' + esc(o.max) + '" step="' + esc(o.step) + '" value="' + esc(o.value) + '"><output for="' + i + '" id="' + i + '-o"></output></label>';
  }
  // a linear scale from the data's range to the drawing's: linear(2016, 2030, 36, 616)(2026)
  const linear = (d0, d1, r0, r1) => v => r0 + (v - d0) * (r1 - r0) / (d1 - d0);
  // a horizontal axis in SVG: its line from x0 to x1 at y, then at each tick ({ x, label }) a 4 px tick
  // mark and its label centred 17 px below the line
  function axis(x0, x1, y, ticks) {
    let s = '<line class="axis" x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '"/>';
    ticks.forEach(t => { s += '<line class="tick" x1="' + t.x + '" y1="' + y + '" x2="' + t.x + '" y2="' + (y + 4) + '"/><text class="mono" x="' + t.x + '" y="' + (y + 17) + '" text-anchor="middle">' + t.label + '</text>'; });
    return s;
  }
  function readout(host, items) {
    host.innerHTML = items.map(it => '<div class="terra-read' + (it.hl ? ' is-hl' : '') + '"><b>' + it.value + '</b><span>' + it.label + '</span></div>').join('');
  }
  // the widget's data and words: the JSON sewn writes into the element from the page's widget block
  function data(el) {
    const s = el.querySelector(':scope > script[type="application/json"]');
    return s ? JSON.parse(s.textContent) : {};
  }
  // the widget frame, as the hand-built widgets had it: head (title, status), "How to use", then the body.
  // A numbered figure (sewn's figures:, 6 November 2026): its number (data-figure) leads the title, and
  // the element's id (the block's id, which sewn puts on it) moves to the frame, which has a box to scroll to.
  function frame(el, d, body) {
    const box = document.createElement('div');
    if (el.id === d.id) el.removeAttribute('id');
    box.innerHTML = '<div class="terra-widget" id="' + esc(d.id) + '"><div class="terra-w-head"><span class="terra-w-title">' + (el.dataset.figure ? '<span class="terra-w-num">' + esc(el.dataset.figure) + '</span> · ' : '') + esc(d.title) + '</span><span class="terra-status">' + esc(d.status) + '</span></div>'
      + '<p class="terra-w-how"><b>How to use</b>' + esc(d.how) + '</p>' + body + '</div>';
    el.appendChild(box.firstChild);
  }
  // a widget's drawing, kept from breaking the rest of the page (as app.js's safe() did)
  function run(name, fn) { try { fn(); } catch (e) { console.error('Widget failed: ' + name, e); } }
  // a phrase from the block's words with its numbers put in: fill('Card {n} of {total}', { n: 2, total: 9 })
  const fill = (s, v) => String(s).replace(/\{([a-z_]+)\}/g, (m, k) => (v && v[k] !== undefined ? String(v[k]) : m));
  // a YAML list that may be missing (sewn's YAML has no empty list)
  const list = x => (Array.isArray(x) ? x : []);

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function qnorm(p) {
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const pl = 0.02425, ph = 1 - pl; let q, r;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > ph) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  window.SewnKit = { $, $$, esc, pct1, fill, seg, slider, readout, linear, axis, data, frame, run, list, mulberry32, qnorm };
})();
