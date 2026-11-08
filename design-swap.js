/* <design-swap>: what a swap between designs buys and costs, component by component; for the
   case-control swap, how many people each design measures. Was widget 12 in app.js (chapter 3,
   section 13); moved here on 6 October 2026. From the page's widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w12-tab, w12-svg, …)
     swaps                      any of cc, hist, rand, eco and desc, in the order to show (the first
                                is shown first; with one swap the control is hidden): each a label,
                                rows (component, buys, costs; a missing one shows as a dash) and a note
     words                      swap (the control's label); rare and per_case (the sliders);
                                svg_label; component, buys and costs (the table's head); cohort and
                                case_control (the bars); aria_label ("… {cases} cases: cohort
                                {cohort}, case-control {case_control} …"); cohort_follows ({cases}),
                                cc_measures and precision (the readout); control and controls;
                                cc_note ({one}, {cohort}, {cases}, {k}, {controls}, {measured},
                                {keep}) and source (added to the case-control swap's note)
   Reuse: copy the block and change the words and each swap's rows; the efficiency part (controls
   per case) belongs to the swap called cc. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, seg, readout } = K;
  class DesignSwap extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-s-l">' + esc(w.swap) + '</span><div class="terra-seg" id="' + id + '-s"></div></div>'
        + '<div class="scrollx"><table class="mtab trade" id="' + id + '-tab"></table></div>'
        + '<div class="mini" id="' + id + '-eff">' + K.slider(d.id, 'p', { label: w.rare, min: '1', max: '4', step: '1', value: '3' })
        + K.slider(d.id, 'k', { label: w.per_case, min: '1', max: '5', step: '1', value: '2' })
        + '<svg class="fig-svg p2" id="' + id + '-svg" role="img" aria-label="' + esc(w.svg_label) + '"></svg>'
        + '<div class="terra-readout" id="' + id + '-read"></div></div>'
        + '<p class="terra-w-note" id="' + id + '-note" aria-live="polite"></p>');
      K.run('design-swap', () => {
        const SW = {};
        Object.keys(d.swaps).forEach(k => { const x = d.swaps[k]; SW[k] = { label: x.label, rows: K.list(x.rows).map(r => [r.component, r.buys || '', r.costs || '']), note: x.note }; });
        let k = Object.keys(SW)[0], pr = 3, kc = 2; const PR = { 1: 20, 2: 100, 3: 1000, 4: 10000 };
        seg(at('s'), Object.keys(SW).map(x => ({ value: x, label: SW[x].label })), k, v => { k = v; render(); }, w.swap);
        if (Object.keys(SW).length < 2) at('s').parentNode.hidden = true;
        at('p').addEventListener('input', e => { pr = +e.target.value; render(); });
        at('k').addEventListener('input', e => { kc = +e.target.value; render(); });
        function render() {
          const sw = SW[k];
          at('tab').innerHTML = '<thead><tr><th>' + esc(w.component) + '</th><th>' + esc(w.buys) + '</th><th>' + esc(w.costs) + '</th></tr></thead><tbody>' + sw.rows.map(r => '<tr><td>' + r[0] + '</td><td class="gain">' + (r[1] || '—') + '</td><td class="cost">' + (r[2] || '—') + '</td></tr>').join('') + '</tbody>';
          at('note').textContent = sw.note;
          const eff = at('eff'); eff.style.display = k === 'cc' ? '' : 'none'; if (k !== 'cc') return;
          const one = PR[pr], cases = 100, coh = cases * one, ccn = cases * (1 + kc), keep = kc / (kc + 1);
          at('p-o').textContent = one.toLocaleString('en-US'); at('k-o').textContent = String(kc);
          const W = 640, x0 = 150, x1 = 600, lg = v => Math.log10(v), max = lg(1e6), bx = v => x0 + (x1 - x0) * lg(v) / max;
          let s = ''; [[w.cohort, coh, 'bar'], [w.case_control, ccn, 'bar lo']].forEach((r, i) => {
            const y = 14 + i * 44;
            s += '<text class="strong" x="0" y="' + (y + 20) + '" style="fill:var(--ink);font-size:13px">' + esc(r[0]) + '</text><rect class="' + r[2] + '" x="' + x0 + '" y="' + y + '" width="' + (bx(r[1]) - x0).toFixed(1) + '" height="28" rx="3"/><text class="mono strong" x="' + (bx(r[1]) + 6).toFixed(1) + '" y="' + (y + 19) + '">' + r[1].toLocaleString('en-US') + '</text>';
          });
          s += '<line class="axis" x1="' + x0 + '" y1="104" x2="' + x1 + '" y2="104"/>'; [1, 10, 100, 1e3, 1e4, 1e5, 1e6].forEach(v => { s += '<text class="mono" x="' + bx(v).toFixed(1) + '" y="118" text-anchor="middle">' + (v >= 1e6 ? '1M' : v >= 1000 ? (v / 1000) + 'k' : v) + '</text>'; });
          const svg = at('svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' 124'); svg.innerHTML = s;
          svg.setAttribute('aria-label', K.fill(w.aria_label, { cases, cohort: coh.toLocaleString('en-US'), case_control: ccn.toLocaleString('en-US') }));
          readout(at('read'), [{ value: coh.toLocaleString('en-US'), label: esc(K.fill(w.cohort_follows, { cases })) }, { value: ccn.toLocaleString('en-US'), label: esc(w.cc_measures) }, { value: Math.round(keep * 100) + '%', label: esc(w.precision), hl: true }]);
          at('note').textContent = sw.note + ' ' + K.fill(w.cc_note, { one: one.toLocaleString('en-US'), cohort: coh.toLocaleString('en-US'), cases, k: kc, controls: kc > 1 ? w.controls : w.control, measured: ccn, keep: Math.round(keep * 100) + '%' }) + ' ' + w.source;
        }
        render();
      });
    }
  }
  if (!customElements.get('design-swap')) customElements.define('design-swap', DesignSwap);
})();
