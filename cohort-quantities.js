/* <cohort-quantities>: twenty invented people over one year, drawn as lifelines in chapter 3's marks;
   choose a number (a count, a prevalence on 1 January or on 31 December, a risk, a rate) and see which
   stretch of each life it observes, which dots it counts and what it divides by, with complete
   follow-up or with departures. Was widget 4 in app.js (chapter 1, section 6); moved to the components
   page on 6 October 2026. PROTOTYPE, 8 November 2026 (components review, scratch only): redrawn in the
   lifeline marks of widgets/life-lines.js, its classes reused (.lv), 440 wide like chapter 3's figures so
   it needs no sideways swipe; it replaces the October marks (a thin grey free line, a thick case line,
   an open ring at onset, shaded rows for the denominator, a ring round the numerator, a filled
   triangle for moving away, a square for dying, a dashed "?" for an unknown outcome, a heavy overlay
   for time at risk, a dashed line on a prevalence's date). The people and every number are unchanged.
   From the page's widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w23-svg, w23-read, …)
     quantities                 count, prev0, prev12, risk and rate: each a label (its button), question
                                (the line over the drawing), rule (the drawing's head line: who is in;
                                {n} people or {py} person-years) and date (the start triangle's word;
                                none for the count, which has no start)
     words                      follow_up, quantity (the switches' labels); complete, departures (the
                                follow-up buttons); svg_label ({n}) and svg_final ({n}, {follow}:
                                follow_comp or follow_dep, {question}, {answer}) (the drawing, for screen
                                readers); jan1, jul1, dec31 (the three ticks); moved, died (words at a
                                line's end); had_it (the word for someone who had diabetes on 1 January);
                                the key: key_h_d, key_h_o (two headings), key_data, key_nodata, key_yes,
                                key_no, key_yet, key_box; the readout: numerator, denominator, none,
                                people ({n}), person_years ({py}), rate_value ({rate}), range ({lo},
                                {hi}), seen_unknown ({seen}, {unknown}); the note: note_count, note_prev0,
                                note_prev12, note_prev12_dep, note_risk, note_risk_dep ({seen}, {upper},
                                {n}), note_rate, note_rate_dep
   Marks (Teaching shared/design/terra/DESIGN.md, lifeline marks, and the proposed entry for this widget):
   one shade, since nothing is compared (as chapter 1's staff figure); thick where the number observes a
   life, thin where it does not (a prevalence one day; a count the whole year; a risk or a rate from
   1 January until diabetes or leaving); the line dashed from where diabetes starts, with a small dot
   there; a filled dot where the number records diabetes (its numerator), an open dot where it records
   none (on a prevalence's day, or a death without diabetes), an open arrow where follow-up stops while
   the person could still get it (the year ends, or they move); words for leaving; on a prevalence's day a
   shaded band behind every row; the start triangle with a dotted upright. The denominator is the people
   drawn thick (a prevalence, a risk) or the thick lines' total length (a rate).
   Reuse: copy the block to reword it; the people are the reading's invented cohort of 20
   (widgets/data.js, K.cohort). */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, seg, readout, pct1, fill } = K;
  const { COHORT, COHORT_C, S_C, S_D } = K.cohort;
  // chapter 3's lifeline geometry (widgets/life-lines.js): 440 wide, the lives from x 40 to 386, rows 15 apart
  const T = 12, X0 = 40, X1 = 386, X = m => X0 + (X1 - X0) * m / T, TOP = 74, RH = 15, PAD = 7;
  const ln = (x1, x2, y, c) => '<line class="' + c + '" x1="' + x1.toFixed(1) + '" y1="' + y + '" x2="' + x2.toFixed(1) + '" y2="' + y + '"/>';
  const tx = (x, y, s, c, anchor) => '<text x="' + x.toFixed(1) + '" y="' + y + '" dy=".35em"' + (c ? ' class="' + c + '"' : '') + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(s) + '</text>';
  const rowY = p => TOP + (p.id - 1) * RH;
  const has = (p, t) => !!p.pre || (p.on != null && p.on <= t);
  const onset = p => (p.pre ? 0 : p.on != null && p.on < p.exit ? p.on : null);
  const tipAt = (x, y) => '<path class="lv-tip" d="M' + (x - 5).toFixed(1) + ' ' + (y - 5.5) + ' L' + (x + 1.5).toFixed(1) + ' ' + y + ' L' + (x - 5).toFixed(1) + ' ' + (y + 5.5) + '"/>';
  // one life, whole: from 1 January to leaving (or 31 December), solid while free, dashed once diabetes
  // has started; a word for leaving
  function life(p, w) {
    const y = rowY(p), on = onset(p), pts = [0].concat(on != null && on > 0 ? [on] : [], [p.exit]);
    let s = '';
    for (let i = 0; i < pts.length - 1; i++) s += ln(X(pts[i]), X(pts[i + 1]), y, 'lv-line' + (on != null && pts[i] >= on ? ' lv-ill' : ''));
    if (p.why) s += tx(X(p.exit) + 8, y, w[p.why], 'lv-word');
    return s;
  }
  const hole = (p, a, b) => { const y = rowY(p), xb = X(b) + 6; return '<rect x="' + (X(a) - 2).toFixed(1) + '" y="' + (y - PAD) + '" width="' + Math.max(4, xb - X(a) + 2).toFixed(1) + '" height="' + (2 * PAD) + '" rx="3"/>'; };

  // what each number observes (used: stretches drawn thick), where it records the outcome (checks:
  // [person, time, has diabetes]), whether a stop without diabetes is censored (an open arrow), the
  // day of a prevalence (box) and the start triangle (date)
  const VIEWS = {
    count: (co) => ({ used: p => [[0, p.exit]], checks: co.filter(p => p.pre || onset(p) != null).map(p => [p, onset(p), true]) }),
    prev0: (co) => ({ date: 0, box: 0, used: () => [[0, 0]], checks: co.map(p => [p, 0, has(p, 0)]) }),
    prev12: (co) => {
      const here = p => p.exit === T && !p.why;
      return { date: T, box: T, used: p => (here(p) ? [[T, T]] : []), checks: co.filter(here).map(p => [p, T, has(p, T)]) };
    },
    risk: (co) => ({ date: 0, censor: true, used: p => (p.pre ? [] : [[0, onset(p) != null ? onset(p) : p.exit]]),
      checks: co.filter(p => !p.pre).map(p => (onset(p) != null ? [p, onset(p), true] : [p, p.exit, false])) })
  };
  VIEWS.rate = VIEWS.risk;

  class CohortQuantities extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, Q = d.quantities, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-fu-l">' + esc(w.follow_up) + '</span><div class="terra-seg" id="' + id + '-fu"></div></div>'
        + '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-seg-l">' + esc(w.quantity) + '</span><div class="terra-seg" id="' + id + '-seg"></div></div>'
        + '<p class="q-line" id="' + id + '-q" aria-live="polite"></p>'
        + '<svg class="fig-svg lv" id="' + id + '-svg" role="img" aria-label="' + esc(fill(w.svg_label, { n: 20 })) + '"></svg>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<p class="terra-w-note" id="' + id + '-note" aria-live="polite"></p>');
      K.run('cohort-quantities', () => {
        const keys = ['count', 'prev0', 'prev12', 'risk', 'rate'];
        let cur = 'prev0', fu = 'comp';
        seg(at('fu'), [{ value: 'comp', label: w.complete }, { value: 'dep', label: w.departures }], fu, v => { fu = v; render(); }, w.follow_up);
        seg(at('seg'), keys.map(k => ({ value: k, label: Q[k].label })), cur, v => { cur = v; render(); }, w.quantity);
        function render() {
          const dep = fu === 'dep', co = dep ? COHORT : COHORT_C, S = dep ? S_D : S_C, q = Q[cur], o = VIEWS[cur](co);
          const bottom = TOP + (co.length - 1) * RH + 12;
          // the readout's numbers, as before the redraw
          let numer = S.ever, den = null;
          if (cur === 'prev0') { numer = S.pre; den = co.length; }
          if (cur === 'prev12') { numer = S.cases12; den = S.at12.length; }
          if (cur === 'risk' || cur === 'rate') { numer = S.inc; den = S.free.length; }
          let lives = '', holes = '', over = '', back = '';
          co.forEach(p => {
            lives += life(p, w);
            o.used(p).forEach(([a, b]) => { holes += hole(p, a, b); });
          });
          if (o.box != null) back += '<rect class="lv-box" x="' + (X(o.box) - 7).toFixed(1) + '" y="' + (TOP - 9) + '" width="14" height="' + (bottom - TOP + 6) + '" rx="4"/>';
          // a small dot where diabetes starts during the year; the words for someone who had it on 1 January, where
          // their 1 January is drawn thin (a filled dot there already says it, and words over a thick line read badly)
          co.forEach(p => { if (p.pre && !o.used(p).some(([a]) => a === 0)) over += tx(X(0) + 9, rowY(p), w.had_it, 'lv-word lv-tag'); else if (!p.pre && onset(p) != null) over += '<g class="lv-e"><circle class="lv-on" cx="' + X(onset(p)).toFixed(1) + '" cy="' + rowY(p) + '" r="3"/></g>'; });
          o.checks.forEach(([p, t, yes]) => { const cx = X(t), cy = rowY(p);
            over += '<g class="lv-e">' + (!yes && o.censor && p.why !== 'died' ? tipAt(cx, cy) : '<circle class="' + (yes ? 'lv-yes' : 'lv-no') + '" cx="' + cx.toFixed(1) + '" cy="' + cy + '" r="4.4"/>') + '</g>'; });
          // the frame: the head line, three ticks, row numbers; the start on top
          let fr = tx(8, 14, fill(q.rule, { n: den == null ? numer.length : den, py: S.py.toFixed(1) }), 'lv-hd');
          [[0, w.jan1], [6, w.jul1], [T, w.dec31]].forEach(([t, s]) => { fr += tx(X(t), 36, s, 'muted', 'middle') + '<line class="tick" x1="' + X(t).toFixed(1) + '" y1="46" x2="' + X(t).toFixed(1) + '" y2="' + bottom + '"/>'; });
          co.forEach(p => { fr += tx(X0 - 12, rowY(p), String(p.id), 'lv-row', 'end'); });
          let start = '';
          if (o.date != null) {
            const x = X(o.date), right = o.date > T / 2;
            start = '<path class="lv-tri" d="M' + (x - 6).toFixed(1) + ' 48 L' + (x + 6).toFixed(1) + ' 48 L' + x.toFixed(1) + ' 57 Z"/>'
              + '<line class="lv-date" x1="' + x.toFixed(1) + '" y1="57" x2="' + x.toFixed(1) + '" y2="' + bottom + '"/>'
              + tx(right ? x - 9 : x + 9, 53, q.date, 'lv-k', right ? 'end' : 'start');
          }
          const defs = '<defs><clipPath id="' + id + '-clip">' + holes + '</clipPath><mask id="' + id + '-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="440" height="' + (bottom + 10) + '">'
            + '<rect x="0" y="0" width="440" height="' + (bottom + 10) + '" fill="white"/>' + holes.replace(/rx="3"\/>/g, 'rx="3" fill="black"/>') + '</mask></defs>';
          // the key, chapter 3's glyphs: Observation (thick, thin), Outcome (only the marks this view draws), then the band
          const glyph = {
            thick: x => '<g class="lv-0">' + ln(x, x + 22, 0, 'lv-line') + '</g>',
            thin: x => '<g class="lv-under lv-0">' + ln(x, x + 22, 0, 'lv-line') + '</g>',
            yes: x => '<g class="lv-e">' + ln(x, x + 7, 0, 'lv-line') + ln(x + 14, x + 25, 0, 'lv-line lv-ill lv-ill-k') + '<circle class="lv-yes" cx="' + (x + 9) + '" cy="0" r="4.6"/></g>',
            no: x => '<g class="lv-e">' + ln(x, x + 16, 0, 'lv-line') + '<circle class="lv-no" cx="' + (x + 18) + '" cy="0" r="4.6"/></g>',
            yet: x => '<g class="lv-e">' + ln(x, x + 16, 0, 'lv-line') + tipAt(x + 18, 0) + '</g>',
            box: x => '<rect class="lv-box" x="' + (x + 5) + '" y="-8" width="12" height="16" rx="3"/>' };
          const item = (k, x, y, s) => '<g transform="translate(0 ' + y + ')">' + glyph[k](x) + '</g>' + tx(x + 30, y, s, 'lv-k');
          const drawn = { yes: o.checks.some(c => c[2]), no: o.checks.some(c => !c[2] && !(o.censor && c[0].why !== 'died')), yet: o.checks.some(c => !c[2] && o.censor && c[0].why !== 'died') };
          const cols = [[w.key_h_d, [['thick', w.key_data], ['thin', w.key_nodata]]],
            [w.key_h_o, [['yes', w.key_yes], ['no', w.key_no], ['yet', w.key_yet]].filter(r => drawn[r[0]])]];
          const ky = bottom + 24;
          let key = '', ky2 = ky;
          cols.forEach(([head, rows], c) => {
            const x = 8 + c * 172;
            key += tx(x, ky, head, 'lv-kh');
            rows.forEach(([k, s], r) => { key += item(k, x, ky + 18 * (r + 1), s); ky2 = Math.max(ky2, ky + 18 * (r + 1)); });
          });
          if (o.box != null) { ky2 += 22; key += item('box', 8, ky2, w.key_box); }
          const svg = at('svg');
          svg.setAttribute('viewBox', '0 0 440 ' + (ky2 + 12));
          // the thin layer is masked out of the observed stretches, so a thick line never shows a thin one through its gaps
          svg.innerHTML = defs + fr + back + '<g class="lv-e"><g class="lv-under" mask="url(#' + id + '-mask)">' + lives + '</g><g clip-path="url(#' + id + '-clip)">' + lives + '</g></g>' + start + over + key;
          // readout (numerator, denominator, the number) and note, as before the redraw
          let res, dlabel, nval = String(numer.length), note;
          if (cur === 'count') { res = fill(w.people, { n: numer.length }); dlabel = w.none; note = w.note_count; }
          else if (cur === 'rate') { res = fill(w.rate_value, { rate: (S.inc.length / S.py * 100).toFixed(1) }); dlabel = fill(w.person_years, { py: S.py.toFixed(1) }); note = dep ? w.note_rate_dep : w.note_rate; }
          else if (cur === 'risk' && dep) {
            const lo = S.inc.length / den, hi = (S.inc.length + S.movers.length) / den;
            res = fill(w.range, { lo: pct1(lo), hi: pct1(hi) }); dlabel = fill(w.people, { n: den }); nval = fill(w.seen_unknown, { seen: S.inc.length, unknown: S.movers.length });
            note = fill(w.note_risk_dep, { seen: S.inc.length, upper: S.inc.length + S.movers.length, n: den });
          } else {
            res = pct1(numer.length / den); dlabel = fill(w.people, { n: den });
            note = cur === 'prev0' ? w.note_prev0 : cur === 'prev12' ? (dep ? w.note_prev12_dep : w.note_prev12) : w.note_risk;
          }
          readout(at('read'), [{ value: esc(nval), label: esc(w.numerator) }, { value: esc(dlabel), label: esc(w.denominator) }, { value: esc(res), label: esc(q.label), hl: true }]);
          at('q').textContent = q.question; at('note').textContent = note;
          svg.setAttribute('aria-label', fill(w.svg_final, { n: 20, follow: dep ? w.follow_dep : w.follow_comp, question: q.question, answer: res }));
        }
        render();
      });
    }
  }
  if (!customElements.get('cohort-quantities')) customElements.define('cohort-quantities', CohortQuantities);
})();
