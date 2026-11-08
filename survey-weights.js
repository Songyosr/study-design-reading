/* <survey-weights>: a survey of 400 PSU adults that oversamples people aged 50 or over: the raw share
   in the sample moves with the sample's make-up, the weighted share does not. Was widget 16 in app.js
   (chapter 4, section 15); moved here on 6 October 2026. From the page's widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w16-o, w16-svg, …)
     words                      slider; figure and figure_now ("…{population}%…{sample}%…", the chart's
                                description); population, sample, under_50 and over_50 ("{pct}", the
                                chart's labels); raw, raw_eighth, weighted, stands_for and stands_value
                                ("{older} and {younger}") (the readout); note ({cases_young}, {young},
                                {cases_old}, {old}, {truth})
   The invented population and its rates are here.
   Reuse: copy the block to reword it; the invented population and its rates are in this file. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, readout, pct1 } = K;
  class SurveyWeights extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<div class="mini">' + K.slider(d.id, 'o', { label: w.slider, min: '40', max: '360', step: '20', value: '300' }) + '</div>'
        + '<svg class="fig-svg" id="' + id + '-svg" role="img" aria-label="' + esc(w.figure) + '"></svg>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<p class="terra-w-note" id="' + id + '-note" aria-live="polite"></p>');
      K.run('survey-weights', () => {
        const PY = 1400, PO = 600, RY = 0.05, RO = 0.15, NS = 400, TRUEP = (PY * RY + PO * RO) / (PY + PO);
        at('o').addEventListener('input', e => { render(+e.target.value); });
        function render(no) {
          const ny = NS - no, cy = ny * RY, co = no * RO, raw = (cy + co) / NS, wy = PY / ny, wo = PO / no, wtd = (cy * wy + co * wo) / (ny * wy + no * wo);
          at('o-o').textContent = String(no);
          const W = 640, x0 = 130, x1 = 600, bw = x1 - x0; let s = '';
          [[w.population, PY / (PY + PO), PO / (PY + PO)], [w.sample, ny / NS, no / NS]].forEach((r, i) => {
            const y = 10 + i * 40;
            s += '<text class="ink strong" x="0" y="' + (y + 18) + '">' + esc(r[0]) + '</text><rect class="seg-y" x="' + x0 + '" y="' + y + '" width="' + (bw * r[1]).toFixed(1) + '" height="26"/><rect class="seg-o" x="' + (x0 + bw * r[1]).toFixed(1) + '" y="' + y + '" width="' + (bw * r[2]).toFixed(1) + '" height="26"/>';
            s += '<text class="mono" x="' + (x0 + 6) + '" y="' + (y + 17) + '">' + esc(K.fill(w.under_50, { pct: Math.round(r[1] * 100) })) + '</text><text class="mono" x="' + (x1 - 6) + '" y="' + (y + 17) + '" text-anchor="end" style="fill:var(--paper)">' + esc(K.fill(w.over_50, { pct: Math.round(r[2] * 100) })) + '</text>';
          });
          const svg = at('svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' 92'); svg.innerHTML = '<g class="p2">' + s + '</g>';
          svg.setAttribute('aria-label', K.fill(w.figure_now, { population: Math.round(PO / (PY + PO) * 100), sample: Math.round(no / NS * 100) }));
          readout(at('read'), [{ value: pct1(raw), label: esc(Math.abs(raw - 0.125) < 1e-9 ? w.raw_eighth : w.raw) }, { value: pct1(wtd), label: esc(w.weighted), hl: true }, { value: esc(K.fill(w.stands_value, { older: wo.toFixed(1), younger: wy.toFixed(1) })), label: esc(w.stands_for) }]);
          at('note').textContent = K.fill(w.note, { cases_young: cy.toFixed(0), young: ny, cases_old: co.toFixed(0), old: no, truth: pct1(TRUEP) });
        }
        render(+at('o').value);
      });
    }
  }
  if (!customElements.get('survey-weights')) customElements.define('survey-weights', SurveyWeights);
})();
