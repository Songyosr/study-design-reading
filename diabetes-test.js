/* <diabetes-test>: the 400 simulated adults stacked by their usual reading on one fasting test, in
   three steps: an ideal line, one cut-off, and measuring again. Was widget 3 in app.js (chapter 1,
   section 5); moved here on 6 October 2026. The adults are the kit's simulated district. From the
   page's widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w3-svg, w3-read, …)
     note                       the note on what is simulated, under the readout
     words                      step (the steps' label and group), step_ideal, step_cut, step_again;
                                cut_label, sd_label (the sliders); again (the button); swipe; svg_label
                                ({n}), svg_ideal ({n}, {x}) and svg_cut ({cut}, {m}, {x}, {fp}, {fn})
                                (the figure, for screen readers); legend, key_case, key_no, key_fp,
                                key_fn (the legend); axis, ideal_mark, cut_mark ({cut}) (the figure);
                                truly, pos_ideal, pos_cut, fp_fn, fp, fn, sens_spec, avg ({reps},
                                {usual}) (the readout); note_ideal, note_cut, note_still, note_again
                                ({reps}, {avg}, {usual}, {drift}: drift_up, drift_down or drift_flat)
                                (the note)
   Reuse: copy the block to reword it; it uses the reading's simulated district
   (widgets/data.js). */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, seg, readout, pct1, mulberry32 } = K;
  const { N, CUT, gluc, diab, TRUE_X } = K.district;
  class DiabetesTest extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-step-l">' + esc(w.step) + '</span><div class="terra-seg" id="' + id + '-step"></div></div>'
        + K.slider(d.id, 'c', { label: w.cut_label, min: '100', max: '160', step: '1', value: '126' })
        + K.slider(d.id, 's', { label: w.sd_label, min: '0', max: '15', step: '1', value: '6' })
        + '<div class="terra-w-controls"><button class="btn" id="' + id + '-new" type="button">' + esc(w.again) + '</button></div>'
        + '<p class="swipe-hint">' + esc(w.swipe) + '</p>'
        + '<div class="scrollx"><svg class="fig-svg" id="' + id + '-svg" role="img" aria-label="' + esc(K.fill(w.svg_label, { n: N })) + '"></svg></div>'
        + '<ul class="legend" aria-label="' + esc(w.legend) + '">'
        + '<li><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" class="d-case"/></svg>' + esc(w.key_case) + '</li>'
        + '<li><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" class="d-no"/></svg>' + esc(w.key_no) + '</li>'
        + '<li><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.2" class="d-fp"/></svg>▲ ' + esc(w.key_fp) + '</li>'
        + '<li><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" class="d-fn"/></svg>▼ ' + esc(w.key_fn) + '</li>'
        + '</ul>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<p class="terra-w-note" id="' + id + '-note" aria-live="polite"></p>'
        + '<p class="terra-w-note">' + esc(d.note) + '</p>');
      K.run('diabetes-test', () => {
        /* fill = reference standard (true glucose 126 or more, the page's 48 of 400). Each dot sits at its usual reading on one fasting
           test: true glucose plus a fixed personal offset (validity). A repeat adds fresh random error (reliability). Dots never move. */
        const OFF = 9;
        function genZ(seed) { const r = mulberry32(seed), z = []; for (let i = 0; i < N; i++) { const u1 = Math.max(r(), 1e-12), u2 = r(); z.push(Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)); } return z; }
        const zOff = genZ(90210), usual = gluc.map((g, i) => g + OFF * zOff[i]);
        const W = { step: 'cut', cut: CUT, sd: 6, zs: 1, z: genZ(1) };
        seg(at('step'), [{ value: 'ideal', label: w.step_ideal }, { value: 'cut', label: w.step_cut }, { value: 'again', label: w.step_again }], W.step, v => { W.step = v; render(); }, w.step);
        at('c').addEventListener('input', e => { W.cut = +e.target.value; render(); });
        at('s').addEventListener('input', e => { W.sd = +e.target.value; render(); });
        at('new').addEventListener('click', () => { W.zs++; W.z = genZ(W.zs); render(); });
        /* layout: 4 mg/dL bins by usual reading; in each bin people without diabetes first, then a small gap, then people with it */
        const pl = 30, pr = 580, x0 = 40, x1 = 200, base = 176, X = K.linear(x0, x1, pl, pr), bw = 4 * (pr - pl) / (x1 - x0), rowH = 6.8, GAP = 4;
        const pos = new Array(N), bins = {}, topY = {};
        for (let i = 0; i < N; i++) { const b = Math.floor((Math.min(199.9, Math.max(40, usual[i])) - 40) / 4); (bins[b] = bins[b] || []).push(i); }
        Object.keys(bins).forEach(b => {
          const arr = bins[b].slice().sort((a, c) => (diab[a] - diab[c]) || (usual[a] - usual[c])), left = X(40 + (+b) * 4);
          const nb = arr.filter(i => !diab[i]).length, rowsB = Math.ceil(nb / 2);
          topY[b] = nb ? base - 4 - (rowsB - 1) * rowH - 3 - GAP / 2 : base;
          arr.forEach((i, j) => {
            const slot = diab[i] ? j - nb : j, col = slot % 2, row = Math.floor(slot / 2);
            pos[i] = [left + bw * (col ? 0.73 : 0.27), diab[i] ? (nb ? base - 4 - rowsB * rowH - GAP - row * rowH : base - 4 - row * rowH) : base - 4 - row * rowH];
          });
        });
        /* the ideal line: just above the people without diabetes in every bin */
        let sq = ''; {
          const pts = []; for (let b = 0; b < 40; b++) { const y = topY[b] != null ? topY[b] : base; pts.push([X(40 + b * 4), y], [X(44 + b * 4), y]); }
          sq = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (let k = 1; k < pts.length; k++) { const a = pts[k - 1], c = pts[k], m = ((a[0] + c[0]) / 2).toFixed(1); sq += ' C' + m + ' ' + a[1].toFixed(1) + ' ' + m + ' ' + c[1].toFixed(1) + ' ' + c[0].toFixed(1) + ' ' + c[1].toFixed(1); }
        }
        const pct0 = x => Math.round(x * 100) + '%';
        function counts(readOf) { let M = 0, FP = 0, FN = 0; for (let i = 0; i < N; i++) { const p = readOf(i) >= W.cut; if (p) M++; if (p && !diab[i]) FP++; if (!p && diab[i]) FN++; } return { M, FP, FN }; }
        const avgCache = {};
        function avgAgain() { const key = W.cut + '|' + W.sd; if (avgCache[key] != null) return avgCache[key]; let s = 0; for (let k = 0; k < 200; k++) { const z = genZ(5000 + k); s += counts(i => usual[i] + W.sd * z[i]).M; } return (avgCache[key] = s / 200); }
        const arrow = (m, ref) => m > ref + 0.05 ? '<span class="t-up">▲ ' : (m < ref - 0.05 ? '<span class="t-down">▼ ' : '<span>');
        function render() {
          at('c-o').textContent = W.cut; at('s-o').textContent = W.sd;
          at('c').disabled = W.step === 'ideal'; at('s').disabled = W.step !== 'again'; at('new').disabled = W.step !== 'again';
          const readOf = W.step === 'again' ? (i => usual[i] + W.sd * W.z[i]) : (i => usual[i]);
          const ticks = []; for (let v = 40; v <= 200; v += 20) ticks.push({ x: X(v), label: v });
          let s = K.axis(pl, pr, base, ticks);
          s += '<text class="mono" x="' + ((pl + pr) / 2) + '" y="' + (base + 34) + '" text-anchor="middle">' + esc(w.axis) + '</text>';
          if (W.step === 'again' && W.sd > 0) s += '<rect class="band-rel" x="' + X(W.cut - 2 * W.sd) + '" y="28" width="' + (X(W.cut + 2 * W.sd) - X(W.cut - 2 * W.sd)) + '" height="' + (base - 28) + '"/>';
          for (let i = 0; i < N; i++) {
            const p = W.step === 'ideal' ? diab[i] : readOf(i) >= W.cut, cls = diab[i] ? (p ? 'd-case' : 'd-fn') : (p ? 'd-fp' : 'd-no');
            s += '<circle cx="' + pos[i][0].toFixed(1) + '" cy="' + pos[i][1].toFixed(1) + '" r="' + (cls === 'd-fp' ? 2.6 : 3) + '" class="' + cls + '"/>';
          }
          if (W.step === 'ideal') s += '<path class="squig" d="' + sq + '"/><text class="mono strong knock" x="' + X(186) + '" y="20" text-anchor="end">' + esc(w.ideal_mark) + '</text>';
          else s += '<line class="ref" x1="' + X(W.cut) + '" y1="28" x2="' + X(W.cut) + '" y2="' + base + '"/><text class="mono strong knock" x="' + Math.min(pr - 30, Math.max(pl + 30, X(W.cut))) + '" y="20" text-anchor="middle">' + esc(K.fill(w.cut_mark, { cut: W.cut })) + '</text>';
          const svg = at('svg'); svg.setAttribute('viewBox', '0 0 600 216'); svg.innerHTML = s;
          const T = TRUE_X;
          if (W.step === 'ideal') {
            svg.setAttribute('aria-label', K.fill(w.svg_ideal, { n: N, x: T }));
            readout(at('read'), [{ value: T + ' (' + pct1(T / N) + ')', label: esc(w.truly) }, { value: T + ' (' + pct1(T / N) + ')', label: esc(w.pos_ideal), hl: true }, { value: '0 · 0', label: esc(w.fp_fn) }]);
            at('note').textContent = w.note_ideal;
            return;
          }
          const c = counts(readOf), sens = (T - c.FN) / T, spec = (N - T - c.FP) / (N - T);
          svg.setAttribute('aria-label', K.fill(w.svg_cut, { cut: W.cut, m: c.M, x: T, fp: c.FP, fn: c.FN }));
          const items = [{ value: T + ' (' + pct1(T / N) + ')', label: esc(w.truly) },
            { value: arrow(c.M, T) + c.M + ' (' + pct1(c.M / N) + ')</span>', label: esc(w.pos_cut), hl: true },
            { value: '<span class="t-up">▲ ' + c.FP + '</span>', label: esc(w.fp) }, { value: '<span class="t-down">▼ ' + c.FN + '</span>', label: esc(w.fn) },
            { value: pct0(sens) + ' · ' + pct0(spec), label: esc(w.sens_spec) }];
          let note = w.note_cut;
          if (W.step === 'again') {
            const base0 = counts(i => usual[i]).M, av = avgAgain();
            items.push({ value: arrow(av, base0) + av.toFixed(1) + '</span>', label: esc(K.fill(w.avg, { reps: 200, usual: base0 })) });
            note = W.sd === 0 ? w.note_still : K.fill(w.note_again, { reps: 200, avg: av.toFixed(1), usual: base0, drift: av > base0 + 0.5 ? w.drift_up : (av < base0 - 0.5 ? w.drift_down : w.drift_flat) });
          }
          readout(at('read'), items); at('note').textContent = note;
        }
        render();
      });
    }
  }
  if (!customElements.get('diabetes-test')) customElements.define('diabetes-test', DiabetesTest);
})();
