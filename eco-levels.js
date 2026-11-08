/* <eco-levels>: what an ecological study sees, and what it cannot. Four invented districts, A to D, on one
   pair of axes (sweet drinks per week, fasting glucose in mg/dL, the diabetes cut-off of 126 a dashed line).
   One tab shows only what the study has, each district a labelled square at its two averages, with the line
   through them running down. The other adds the people inside the districts, a dot each (filled at 126 or
   more), and a faint line through all of them running up: Robinson's ecological fallacy, the districts one
   way and the people the other. A switch under the chart (or a tap on a square) brings one district's people
   forward, fades the rest and draws that district's own line, which runs up too. Built 8 November 2026 from
   a prototype, with Tonn, in place of chapter 5's static districts figure (includes/describe/eco-fig.html,
   no longer used). Its second version the same day: the people pooled run up, the districts overlap more and
   the age gap is smaller; a district's own line only when it is brought forward (all four at once hid the
   line across the districts); 126 among the axis numbers. Marks: DESIGN.md, "Chapter 5's widgets". From the
   page's widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w29-v, w29-svg, w29-d, w29-key, …)
     words                      view, sees, hidden (the tabs); focus and all (the switch under the chart);
                                districts (the four names, in this file's order); axis_x, axis_y and cut
                                (the chart); legend, key_unit, key_across, key_pooled, key_within, key_case,
                                key_no (the key); svg_sees ("{list}"), svg_hidden ("{n}", "{list}",
                                "{pooled}"), svg_item ("{name}", "{drinks}", "{glucose}"), svg_item_in
                                ("{name}", "{n}", "{cases}", "{slope}"), svg_focus ("{name}", "{slope}") and
                                item_sep (the chart, for screen readers); down, up, across ("{slope}"),
                                pooled ("{n}", "{slope}"), within_one ("{name}", "{slope}"), rows, people (the
                                readout, three at most); note_sees and note_hidden ("{b}") (the note)
   Here: the truth. Each district has a size, a usual number of sweet drinks a week (4, 5.5, 7, 8.5) and an
   average glucose at that number (118, 113, 108, 103 mg/dL), set by its age mix: A the oldest, D the youngest,
   and the younger the district, the more it drinks. A person's drinks are their district's usual number plus
   a normal spread (SD 3, to one decimal, drawn again until within 0 to 14); their glucose is their district's
   average, plus B mg/dL for each drink a week above the district's usual number, times a log-normal spread
   (SD 0.055 on the log scale, about 6 mg/dL, longer upwards, as glucose is), to a whole mg/dL. So at no
   drinks A's glucose would be 110 and D's 86: an age gap of 24 mg/dL. Drawn from mulberry32(SEED), so
   everyone sees the same people. The seed was chosen (seed-search.mjs) so that all the people pooled run up
   clearly, the district averages run down in order and spread as designed, every district's own line is
   within 0.25 of B, and the filled dots are in A and B. The lines are least squares: through all the people
   with district ignored; within a district over its people; across districts over the four averages (one
   row per district, unweighted, as an ecological study would have them). With this seed (check.py, from the
   dots as drawn): averages A 4.3 drinks and 116.3 mg/dL, B 5.3 and 113.6, C 6.7 and 107.9, D 8.0 and 103.0;
   across −3.56; all people +1.05; within A +2.17, B +2.13, C +2.13, D +2.10; 6, 2, 0 and 0 at 126 or more.
   Reuse: copy the block to reword it; the districts, the truth and the seed are in this file. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, seg, readout, mulberry32 } = K;
  const SEED = 20265631, B = 2, SD_X = 3, SD_LOG = 0.055, X_MAX = 14, CUT = 126;
  const DIST = [{ n: 24, x: 4, g: 118 }, { n: 31, x: 5.5, g: 113 }, { n: 34, x: 7, g: 108 }, { n: 27, x: 8.5, g: 103 }];
  function people() {
    const r = mulberry32(SEED), z = () => K.qnorm(Math.min(1 - 1e-9, Math.max(1e-9, r())));
    const out = [];
    DIST.forEach((d, k) => {
      for (let i = 0; i < d.n; i++) {
        let x; do { x = Math.round((d.x + SD_X * z()) * 10) / 10; } while (x < 0 || x > X_MAX);   // drawn again until within 0 to 14
        out.push({ k, x, g: Math.round((d.g + B * (x - d.x)) * Math.exp(SD_LOG * z())) });
      }
    });
    return out;
  }
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  function fit(xs, ys) { // least squares: { mx, my, b }
    const mx = mean(xs), my = mean(ys); let sxy = 0, sxx = 0;
    xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) * (x - mx); });
    return { mx, my, b: sxy / sxx };
  }
  const sg = v => (Math.round(v * 10) < 0 ? '−' : '+') + Math.abs(v).toFixed(1);
  class EcoLevels extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-v-l">' + esc(w.view) + '</span><div class="terra-seg" id="' + id + '-v"></div></div>'
        + '<svg class="fig-svg dz lf" id="' + id + '-svg" viewBox="0 0 360 290" role="img"></svg>'
        + '<div class="terra-w-controls" id="' + id + '-dc"><span class="ctl-label" id="' + id + '-d-l">' + esc(w.focus) + '</span><div class="terra-seg" id="' + id + '-d"></div></div>'
        + '<ul class="legend" id="' + id + '-key" aria-label="' + esc(w.legend) + '"></ul>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<p class="terra-w-note" id="' + id + '-note" aria-live="polite"></p>');
      K.run('eco-levels', () => {
        const names = K.list(w.districts), P = people(), n = P.length;
        const by = DIST.map((_, k) => P.filter(p => p.k === k));
        const own = by.map(q => fit(q.map(p => p.x), q.map(p => p.g)));          // each district's own line, through its averages
        const cases = by.map(q => q.filter(p => p.g >= CUT).length);
        const across = fit(own.map(o => o.mx), own.map(o => o.my));               // the line through the four averages
        const pooled = fit(P.map(p => p.x), P.map(p => p.g));                       // the line through all the people, district ignored
        // the chart: 360 wide, drinks 0 to 14 across, glucose 80 to 140 up
        const x0 = 40, x1 = 350, yT = 30, yB = 246, X = K.linear(0, X_MAX, x0, x1), Y = K.linear(80, 140, yB, yT), f = v => v.toFixed(1);
        let view = 'sees', pick = 'all';
        seg(at('v'), [{ value: 'sees', label: w.sees }, { value: 'hidden', label: w.hidden }], view, v => { view = v; render(); }, w.view);
        const segD = seg(at('d'), [{ value: 'all', label: w.all }].concat(names.map((nm, k) => ({ value: String(k), label: nm }))), pick, v => { pick = v; render(); }, w.focus);
        // a tap on a district's square brings it forward, a second tap brings everyone back (the switch does the same with keys)
        at('svg').addEventListener('click', e => {
          const t = e.target.closest('[data-k]'); if (!t || view !== 'hidden') return;
          pick = pick === t.dataset.k ? 'all' : t.dataset.k; segD.set(pick); render();
        });
        function render() {
          // the first tab has no people, so nothing is brought forward there (the choice waits for the second tab)
          const hid = view === 'hidden', back = k => (hid && pick !== 'all' && String(k) !== pick ? ' eco-fade' : '');
          let s = '';
          [80, 100, 120, 140].forEach(t => { s += '<line class="tick" x1="' + x0 + '" y1="' + f(Y(t)) + '" x2="' + x1 + '" y2="' + f(Y(t)) + '"/><text class="muted" x="' + (x0 - 6) + '" y="' + f(Y(t)) + '" text-anchor="end" dy=".35em">' + t + '</text>'; });
          s += K.axis(x0, x1, yB, [0, 2, 4, 6, 8, 10, 12, 14].map(t => ({ x: X(t), label: t })));
          s += '<text class="muted" x="4" y="12">' + esc(w.axis_y) + '</text><text class="muted" x="' + x1 + '" y="' + (yB + 38) + '" text-anchor="end">' + esc(w.axis_x) + '</text>';
          // the cut-off: 126 among the axis's numbers, and a short word over the line's left end, where nobody's glucose reaches it
          s += '<line class="ref-heading" x1="' + x0 + '" y1="' + f(Y(CUT)) + '" x2="' + x1 + '" y2="' + f(Y(CUT)) + '"/><text class="strong" x="' + (x0 - 6) + '" y="' + f(Y(CUT)) + '" text-anchor="end" dy=".35em">' + CUT + '</text>'
            + '<text class="knock" x="' + (x0 + 4) + '" y="' + f(Y(CUT) - 7) + '">' + esc(w.cut) + '</text>';
          // the line across the four districts, a little past the first and the last
          const a0 = Math.min(...own.map(o => o.mx)) - 1.5, a1 = Math.max(...own.map(o => o.mx)) + 1.5, ay = x => across.my + across.b * (x - across.mx);
          s += '<line class="eco-across" x1="' + f(X(a0)) + '" y1="' + f(Y(ay(a0))) + '" x2="' + f(X(a1)) + '" y2="' + f(Y(ay(a1))) + '"/>';
          if (hid) {
            // the line through all the people, faint, from the fewest drinks to the most
            const p0 = Math.min(...P.map(p => p.x)), p1 = Math.max(...P.map(p => p.x)), py = x => pooled.my + pooled.b * (x - pooled.mx);
            s += '<line class="eco-pool" x1="' + f(X(p0)) + '" y1="' + f(Y(py(p0))) + '" x2="' + f(X(p1)) + '" y2="' + f(Y(py(p1))) + '"/>';
            // the people, a dot each: filled at 126 or more; then the brought-forward district's own line, 2.5 drinks either side of
            // its average (with all four drawn at once, they hid the line across the districts, so a district's line waits for it to be chosen)
            P.forEach(p => { s += '<circle class="eco-p ' + (p.g >= CUT ? 'd-case' : 'd-no') + back(p.k) + '" cx="' + f(X(p.x)) + '" cy="' + f(Y(p.g)) + '" r="3.4" data-d="' + p.k + '"/>'; });
            own.forEach((o, k) => {
              if (String(k) !== pick) return;
              const u0 = Math.max(0, o.mx - 2.5), u1 = Math.min(X_MAX, o.mx + 2.5), uy = x => o.my + o.b * (x - o.mx);
              const ln = 'x1="' + f(X(u0)) + '" y1="' + f(Y(uy(u0))) + '" x2="' + f(X(u1)) + '" y2="' + f(Y(uy(u1))) + '"';
              s += '<line class="eco-in-k" ' + ln + '/><line class="eco-in" ' + ln + '/>';
            });
          }
          // each district a labelled square at its two averages
          own.forEach((o, k) => {
            s += '<g class="eco-sq' + (hid ? ' eco-pick' : '') + back(k) + '" data-k="' + k + '"><rect class="eco-unit" x="' + f(X(o.mx) - 8) + '" y="' + f(Y(o.my) - 8) + '" width="16" height="16" rx="3"/>'
              + '<text class="strong on" x="' + f(X(o.mx)) + '" y="' + f(Y(o.my)) + '" text-anchor="middle" dy=".35em">' + esc(names[k]) + '</text></g>';
          });
          const svg = at('svg'); svg.innerHTML = s;
          const items = own.map((o, k) => K.fill(w.svg_item, { name: names[k], drinks: o.mx.toFixed(1), glucose: Math.round(o.my) })).join(w.item_sep);
          const itemsIn = own.map((o, k) => K.fill(w.svg_item_in, { name: names[k], n: by[k].length, cases: cases[k], slope: sg(o.b) })).join(w.item_sep);
          svg.setAttribute('aria-label', hid ? K.fill(w.svg_hidden, { n, list: itemsIn, pooled: sg(pooled.b) }) + (pick !== 'all' ? ' ' + K.fill(w.svg_focus, { name: names[+pick], slope: sg(own[+pick].b) }) : '') : K.fill(w.svg_sees, { list: items }));
          at('dc').style.display = hid ? '' : 'none';
          // the key: only what this tab draws
          const sw = (mark, wd) => '<svg class="fig-svg dz lf" width="' + (wd || 26) + '" height="14" viewBox="0 0 ' + (wd || 26) + ' 14" aria-hidden="true" style="width:' + (wd || 26) + 'px">' + mark + '</svg>';
          let key = '<li>' + sw('<rect class="eco-unit" x="1" y="1" width="12" height="12" rx="2"/>', 14) + esc(w.key_unit) + '</li>'
            + '<li>' + sw('<line class="eco-across" x1="1" y1="7" x2="25" y2="7"/>') + esc(w.key_across) + '</li>';
          if (hid) key += '<li>' + sw('<line class="eco-pool" x1="1" y1="10" x2="25" y2="4"/>') + esc(w.key_pooled) + '</li>'
            + (pick !== 'all' ? '<li>' + sw('<line class="eco-in" x1="2" y1="11" x2="24" y2="3"/>') + esc(w.key_within) + '</li>' : '')
            + '<li>' + sw('<circle class="eco-p d-case" cx="7" cy="7" r="3.4"/>', 14) + esc(w.key_case) + '</li>'
            + '<li>' + sw('<circle class="eco-p d-no" cx="7" cy="7" r="3.4"/>', 14) + esc(w.key_no) + '</li>';
          at('key').innerHTML = key;
          const r1 = { value: esc(w.down), label: esc(K.fill(w.across, { slope: sg(across.b) })), hl: !hid };
          if (!hid) readout(at('read'), [r1, { value: String(own.length), label: esc(w.rows) }]);
          else {
            // three at most: across, all the people together, then the people behind the rows, or the district brought forward's own line
            const k = pick === 'all' ? -1 : +pick;
            readout(at('read'), [r1, { value: esc(w.up), label: esc(K.fill(w.pooled, { n, slope: sg(pooled.b) })), hl: k < 0 },
              k < 0 ? { value: String(n), label: esc(w.people) } : { value: esc(w.up), label: esc(K.fill(w.within_one, { name: names[k], slope: sg(own[k].b) })), hl: true }]);
          }
          at('note').textContent = hid ? K.fill(w.note_hidden, { b: B.toFixed(1) }) : w.note_sees;
        }
        render();
      });
    }
  }
  if (!customElements.get('eco-levels')) customElements.define('eco-levels', EcoLevels);
})();
