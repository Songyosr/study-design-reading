/* <design-name>: answer for each component (which way the study traced, timing, how the groups formed,
   the unit of a row) and the design's name follows, with its timeline, the number it can give, when
   exposure is measured, what it buys and its usual worry. A row that is a group does not replace the
   design: it gives that design's ecological version, its name from eco_names, its worries plus eco_worry.
   Was widget 11 in app.js (chapter 3, section 12); moved here on 6 October 2026; ecological made a
   modifier of any design on 4 November 2026 (it had replaced every design). From the page's widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w11-svg, w11-dl, …)
     designs                    cs, co, cc, rct and nrt: each its name, what it gives,
                                exposure_measured, buys and worry
     eco_names                  cs, co, cc, rct and nrt: the name of each design with groups as rows
     words                      the group headings (population_time, estimation); the controls'
                                labels (traced, timing, row_is, groups_formed) and their choices
                                (at_one_date, forward, back, by_people, by_chance, by_rule,
                                historical, concurrent, mixed, a_person, a_group); the timeline
                                (svg_label, already, after_start, e_mark, o_mark, e_chance, e_rule,
                                rows_groups); the readout (design_name, can_give); the list
                                (exposure_measured, what_buys, usual_worry); aria_label ("Worksheet
                                timeline: {name}. {why}"); for a row that is a group, eco_gives ("{gives}"),
                                eco_measured, eco_buys and eco_worry; and the sentences of the reasons: eco_why, eco_periods,
                                cs_why, cs_locked, cc_why, cc_locked, cc_mixed, cc_historical,
                                cc_concurrent, rct_why, nrt_why, co_why, co_concurrent,
                                co_historical, co_mixed
   The reasons that explain each name are built from the choices, so they stay here.
   Reuse: copy the block to reword it; the rules that name a design from the answers are the
   lesson, in this file. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, seg, readout } = K;
  class DesignName extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<p class="grp-k terra-t-a">' + esc(w.population_time) + '</p>'
        + '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-e-l">' + esc(w.traced) + '</span><div class="terra-seg" id="' + id + '-e"></div></div>'
        + '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-t-l">' + esc(w.timing) + '</span><div class="terra-seg" id="' + id + '-t"></div></div>'
        + '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-u-l">' + esc(w.row_is) + '</span><div class="terra-seg" id="' + id + '-u"></div></div>'
        + '<p class="grp-k terra-t-c">' + esc(w.estimation) + '</p>'
        + '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-a-l">' + esc(w.groups_formed) + '</span><div class="terra-seg" id="' + id + '-a"></div></div>'
        + '<svg class="fig-svg p2" id="' + id + '-svg" role="img" aria-label="' + esc(w.svg_label) + '"></svg>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<dl class="srcdl" id="' + id + '-dl"></dl>'
        + '<p class="terra-w-note" id="' + id + '-note" aria-live="polite"></p>');
      K.run('design-name', () => {
        const S = { e: 'before', a: 'people', t: 'concurrent', u: 'persons' };
        seg(at('e'), [{ value: 'before', label: w.forward }, { value: 'outcome', label: w.back }, { value: 'date', label: w.at_one_date }], S.e, v => { S.e = v; render(); }, w.traced);
        const segA = seg(at('a'), [{ value: 'people', label: w.by_people }, { value: 'chance', label: w.by_chance }, { value: 'rule', label: w.by_rule }], S.a, v => { S.a = v; render(); }, w.groups_formed);
        const segT = seg(at('t'), [{ value: 'historical', label: w.historical }, { value: 'mixed', label: w.mixed }, { value: 'concurrent', label: w.concurrent }], S.t, v => { S.t = v; render(); }, w.timing);
        // choices the direction rules out are greyed: an assigned exposure needs a forward study, and one
        // date cannot fall on both sides of the start; a choice already made that is ruled out falls back
        function lock() {
          const offA = S.e !== 'before', offT = S.e === 'date';
          at('a').querySelectorAll('button').forEach(b => { b.disabled = offA && b.dataset.v !== 'people'; });
          at('t').querySelectorAll('button').forEach(b => { b.disabled = offT && b.dataset.v === 'mixed'; });
          if (offA && S.a !== 'people') { S.a = 'people'; segA.set('people'); }
          if (offT && S.t === 'mixed') { S.t = 'concurrent'; segT.set('concurrent'); }
        }
        seg(at('u'), [{ value: 'persons', label: w.a_person }, { value: 'groups', label: w.a_group }], S.u, v => { S.u = v; render(); }, w.row_is);
        const P = {};
        ['cs', 'co', 'cc', 'rct', 'nrt'].forEach(k => { const x = d.designs[k]; P[k] = { meas: x.exposure_measured, n: x.name, num: x.gives, buy: x.buys, worry: x.worry }; });
        function name() {
          const r = design();
          if (S.u === 'groups') { r.eco = true; r.why += ' ' + w.eco_why + (r.k === 'co' ? ' ' + w.eco_periods : ''); }
          return r;
        }
        function design() {
          if (S.e === 'date') return { k: 'cs', why: w.cs_why + ' ' + w.cs_locked };
          if (S.e === 'outcome') return { k: 'cc', why: w.cc_why + ' ' + w.cc_locked + ' ' + (S.t === 'mixed' ? w.cc_mixed : S.t === 'historical' ? w.cc_historical : w.cc_concurrent) };
          if (S.a === 'chance') return { k: 'rct', why: w.rct_why };
          if (S.a === 'rule') return { k: 'nrt', why: w.nrt_why };
          const tw = { concurrent: w.co_concurrent, historical: w.co_historical, mixed: w.co_mixed }[S.t];
          return { k: 'co', why: w.co_why + ' ' + tw };
        }
        function draw(k, eco) {
          const W = 640, H = 96, x0 = 20, x1 = W - 30, mid = (x0 + x1) / 2, y = 52, X = p => mid + p * (x1 - x0) / 12;
          let s = '<rect class="tl-band" x="' + x0 + '" y="16" width="' + (mid - x0) + '" height="' + (y - 16) + '"/><line class="tl-base" x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '"/><path class="tl-tri" d="M' + x1 + ' ' + (y - 6) + ' L' + (x1 + 12) + ' ' + y + ' L' + x1 + ' ' + (y + 6) + ' Z"/>';
          s += '<line class="tl-start" x1="' + mid + '" y1="16" x2="' + mid + '" y2="' + y + '"/><path class="tl-tri" d="M' + (mid - 8) + ' ' + (y + 2) + ' L' + (mid + 8) + ' ' + (y + 2) + ' L' + mid + ' ' + (y + 16) + ' Z"/>';
          s += '<text class="mono" x="' + x0 + '" y="12">' + esc(w.already) + '</text><text class="mono" x="' + x1 + '" y="12" text-anchor="end">' + esc(w.after_start) + '</text>';
          const sh = { historical: -6, concurrent: 0, mixed: -3 }[S.t];
          let E, O, entry, arr;
          if (k === 'cs') { E = S.t === 'historical' ? -3.4 : 0.5; O = E + 0.9; entry = ''; }
          else if (k === 'cc') { E = { historical: -5, concurrent: 0.6, mixed: -3 }[S.t]; O = { historical: -1.5, concurrent: 2.5, mixed: 1 }[S.t]; entry = ''; arr = ['O', 'E']; }
          else { E = sh === 0 ? 0.5 : sh * 0.75; O = sh === 0 ? 4 : (S.t === 'mixed' ? 2.5 : -1.5); entry = ''; arr = ['E', 'O']; }
          const cy = y - 14;
          if (arr) { const xa = X(arr[0] === 'E' ? E : O), xb = X(arr[0] === 'E' ? O : E), dd = xb > xa ? 1 : -1; s += '<line class="tl-arr" x1="' + (xa + dd * 14) + '" y1="' + cy + '" x2="' + (xb - dd * 24) + '" y2="' + cy + '"/><path class="tl-ah" d="M' + (xb - dd * 13) + ' ' + cy + ' L' + (xb - dd * 25) + ' ' + (cy - 6) + ' L' + (xb - dd * 25) + ' ' + (cy + 6) + ' Z"/>'; }
          [['E', E], ['O', O]].forEach(m => {
            const full = entry === 'both' || entry === m[0], cx = X(m[1]);
            if (eco) s += '<rect class="tl-grp" x="' + (cx - 16) + '" y="' + (cy - 12) + '" width="32" height="24" rx="5"/>';
            s += '<circle class="' + (full ? 'tl-full' : 'tl-hol') + '" cx="' + cx + '" cy="' + cy + '" r="12"/><text class="' + (full ? 'lf' : 'lh') + '" x="' + cx + '" y="' + (cy + 4.5) + '" text-anchor="middle">' + esc(m[0] === 'E' ? w.e_mark : w.o_mark) + '</text>';
          });
          if (k === 'rct' || k === 'nrt') s += '<text class="ink" x="' + (X(E)) + '" y="' + (y + 34) + '" text-anchor="middle">' + esc(k === 'rct' ? w.e_chance : w.e_rule) + '</text>';
          if (eco) s += '<text class="ink" x="' + (X(O)) + '" y="' + (y + 34) + '" text-anchor="middle">' + esc(w.rows_groups) + '</text>';
          const svg = at('svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = s;
        }
        function render() {
          lock();
          const r = name(), p = P[r.k], n = r.eco ? d.eco_names[r.k] : p.n; draw(r.k, r.eco);
          readout(at('read'), [{ value: n, label: esc(w.design_name), hl: true }, { value: r.eco ? K.fill(w.eco_gives, { gives: p.num }) : p.num, label: esc(w.can_give) }]);
          at('dl').innerHTML = '<dt>' + esc(w.exposure_measured) + '</dt><dd>' + (r.eco ? w.eco_measured : p.meas) + '</dd><dt>' + esc(w.what_buys) + '</dt><dd>' + (r.eco ? w.eco_buys : p.buy) + '</dd><dt>' + esc(w.usual_worry) + '</dt><dd>' + p.worry + (r.eco ? '; ' + w.eco_worry : '') + '</dd>';
          at('note').textContent = r.why;
          at('svg').setAttribute('aria-label', K.fill(w.aria_label, { name: n, why: r.why }));
        }
        render();
      });
    }
  }
  if (!customElements.get('design-name')) customElements.define('design-name', DesignName);
})();
