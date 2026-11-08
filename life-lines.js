/* <life-lines>: twenty invented staff on the school's staff register, drawn as lifelines from 2016 to
   2026, and what a study design uses of them. Every design draws the same twenty lives, one row each
   in the same order; the design only decides which stretches it uses (drawn thick and clear) and which
   it has no data on (drawn thin), where it checks for diabetes, and where it starts.
   Tabs switch the design (chapter 3's overview) or one contrast within a design (each design's
   section): the survey's date, 2026 or 2016; the cohort, prospective with yearly tests or retrospective
   from clinic records, and its clock, calendar years or time since joining; the case-control study's
   controls, from the staff or from a health fair outside it (7 November 2026; an index-date version until then); the trial's arms, by coin or by choice. Under
   the drawing, the design's three numbers and a note on why they moved. Rewritten on 5 November 2026
   in the marks agreed with Tonn that day (it drew thin-free, thick-diabetes lines with faint and dashed
   stretches from 3 November). From the page's widget block (YAML):
     id, title, status, how   the frame (id prefixes the parts' ids: w24-svg, w24-read, …)
     designs                  which designs to show: survey, cohort, cc, trial (with more than one, a
                              design switch)
     contrast                 true to show each design's own two-way switch (and the cohort's clock)
     views                    for each design: label (its tab); switch (the contrast's label) and
                              options (two, value: label; the first is the default); for the cohort,
                              clock (the clock switch's label) and clock_options (calendar, zero), and
                              found: onset to find each case the day it starts (a first figure);
                              rate: true to read out rates per 100 person-years instead of risks, with
                              r_e and r_ne then templates ({c} cases, {t} person-years); rule
                              and svg_label ({n} {total} {c}), date (the start's label), key_e and
                              key_ne (what the two shades mean), r_e, r_ne, r_ratio (the readout's
                              labels) and note; any of these may end in _<option> for that option alone
                              (note_zero: the cohort's note on the time-zero clock)
     words                    design (the design switch's label); moved, died; zero (the time-zero
                              axis's last label); of ({a} {b} {p}); the key: key_h_e, key_h_d,
                              key_h_o (the three headings), key_data, key_nodata, key_yes, key_no,
                              had_it (the word for someone who had diabetes when hired), key_link, key_coin
                              (and, in a trial's view, key_coin_no: the two arms' diamonds), key_visit
   What {n} and {c} count: survey, present on the day and with diabetes then; cohort, entered and new
   cases found; cc, cases and controls; trial, people and daily drinkers.
   Marks (Teaching shared/design/terra/DESIGN.md, lifeline marks; three, from Tonn on 5 November):
   colour is the exposure (slate drinks daily, faint slate not; in a trial too, where a drinker in the
   programme turns faint half a year after the coin (until 7 November 2026 a trial coloured the arm, grey
   before the coin); students' text names no colour, the key carries it); thickness is what the design observes
   (thick, observed; thin, not; no veil, so a thin line keeps its exposure colour);
   dots are the outcome (filled or open where the study records diabetes or none: survey day, a case or
   control on its date); people from outside the staff (a case-control study's health-fair controls) sit in
   rows below the staff, after a gap and a label (words: outside), drawn only as what the study observes,
   their look-back and their dot, outside every shaded band (Tonn, 7 November 2026); a follow-up design (cohort, trial) ends a life without diabetes in an
   open arrow instead (unfilled, its tip on the end; filled means diabetes, open means none), censored
   (no diabetes yet when follow-up stopped: 2026 or moved; key_no may
   be set per view, as "no diabetes yet"), but a death without diabetes in an open dot, the status for
   good (Tonn, 6 November 2026), so a follow-up key shows both. Where diabetes really starts, a small dot, and
   the line dashed from there: the key's outcome glyphs carry the dash (a solid line to an open dot;
   a solid line into a filled dot, dashed after it), so it needs no entry of its own. A shaded band behind the lives on
   the day people are taken: the survey's day (everyone there), or in a case-control study each
   case's date (the people its control could have come from); key_box may be set per view. Words for leaving; a thin upright joins a case to its control, a diamond is the coin (filled, the programme; open, as usual; words key_coin and key_coin_no, per view), short ticks are
   clinic visits, and the triangle with a dotted upright is the study start (never on the time-zero
   clock). The key has three columns, Exposure, Data and Outcome, then the design's own extras (6 November: Data became Observation).
   Reuse: copy a block to reword it, or to offer fewer designs; the staff and each design's choices
   (cases and controls, arms, who declined, the clinic visits, hiring dates) are the reading's, in
   widgets/data.js (K.castle). */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, seg, readout, fill } = K;
  const T = 10, X0 = 40, X1 = 386, X = t => X0 + (X1 - X0) * t / T;
  const TOP = 74, RH = 15, PAD = 7;
  const ln = (x1, x2, y, c) => '<line class="' + c + '" x1="' + x1.toFixed(1) + '" y1="' + y + '" x2="' + x2.toFixed(1) + '" y2="' + y + '"/>';
  const tx = (x, y, s, c, anchor) => '<text x="' + x.toFixed(1) + '" y="' + y + '" dy=".35em"' + (c ? ' class="' + c + '"' : '') + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(s) + '</text>';
  const has = (p, t) => p.pre || (p.on != null && p.on <= t);
  const pc = (a, b) => (b ? Math.round(100 * a / b) + '%' : '–');
  // a ratio of two shares a/b and c/d, or of their odds
  const ratio = (a, b, c, d, odds) => { const r = odds ? (a / (b - a)) / (c / (d - c)) : (a / b) / (c / d); return !isFinite(r) ? '–' : r === 0 ? '0' : r < 1 ? r.toFixed(2) : r.toFixed(1); };
  const rowY = p => TOP + (p.id - 1) * RH;
  const shadeOf = p => (p.e ? 'lv-e' : 'lv-n');

  // where diabetes starts (at joining for someone who already had it): the line turns dashed there
  const onset = p => (p.pre ? p.hired : p.on != null && p.on < p.exit ? p.on : null);

  // one life, whole: a line from joining to leaving (or 2026) in its shade, solid while free and dashed
  // once diabetes has started (unnamed in the key), and a word for leaving. shade(t) gives the shade from
  // time t; cuts are the times the shade may change (a trial's drinker in the programme stopping); sh shifts the clock.
  function life(p, w, sh, shade, cuts) {
    const y = rowY(p), x = t => X(t - sh), on = onset(p);
    const pts = [p.hired].concat((cuts || []).filter(t => t != null && t > p.hired && t < p.exit), on != null && on > p.hired ? [on] : [], [p.exit]).sort((a, b) => a - b);
    let s = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (b > a) s += '<g class="' + shade(a) + '">' + ln(x(a), x(b), y, 'lv-line' + (on != null && a >= on ? ' lv-ill' : '')) + '</g>';
    }
    if (p.why) s += tx(x(p.exit) + 8, y, w[p.why], 'lv-word');
    return s;
  }

  // a stretch the design has data on, as a clear window: a to b on p's row
  function hole(p, a, b, sh) {
    const y = rowY(p), xb = X(b - sh) + 6;
    return '<rect x="' + (X(a - sh) - 2).toFixed(1) + '" y="' + (y - PAD) + '" width="' + Math.max(4, xb - X(a - sh) + 2).toFixed(1) + '" height="' + (2 * PAD) + '" rx="3"/>';
  }

  class LifeLines extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words || {}, V = d.views || {}, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      const keys = K.list(d.designs).filter(k => V[k]);
      K.frame(this, d, (keys.length > 1 ? '<div class="terra-w-controls"><span class="ctl-label">' + esc(w.design) + '</span><div class="terra-seg" id="' + id + '-view"></div></div>' : '')
        + (d.contrast ? '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-cl"></span><div class="terra-seg" id="' + id + '-ct"></div></div>'
          + '<div class="terra-w-controls" id="' + id + '-clk" style="display:none"><span class="ctl-label" id="' + id + '-kl"></span><div class="terra-seg" id="' + id + '-kt"></div></div>' : '')
        + '<svg class="fig-svg lv" id="' + id + '-svg" role="img"></svg>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<p class="terra-w-note" id="' + id + '-note" aria-live="polite"></p>');
      K.run('life-lines', () => {
        const C = K.castle, by = {};
        C.people.forEach(p => { by[p.id] = p; });
        let design = keys[0], variant = Object.keys(V[design].options || {})[0], clock = 'calendar';
        const draw = () => {
          const v = V[design], zero = design === 'cohort' && clock === 'zero';
          const word = k => (zero && v[k + '_zero'] != null ? v[k + '_zero'] : v[k + '_' + variant] != null ? v[k + '_' + variant] : v[k] != null ? v[k] : w[k]);
          const o = DESIGNS[design](C, by, variant, v), svg = at('svg'), people = o.people || C.people;
          const sh = p => (zero ? p.hired : 0), shade = o.shade || (p => () => shadeOf(p));
          // people from outside the staff (o.outside: a case-control study's health-fair controls): rows below the
          // staff, after a gap and a label; only what the study observes of them is drawn, a thick look-back and
          // an open dot, since nothing else of their lives is known; the shaded bands stay on the staff
          const out = o.outside, lastY = TOP + (C.people.length - 1) * RH, outY = i => lastY + 40 + i * RH;
          const staffBottom = lastY + 12, bottom = out ? outY(out.people.length - 1) + 12 : staffBottom;
          let lives = '', holes = '', over = '';
          people.forEach(p => {
            lives += life(p, w, sh(p), shade(p), o.turn ? [o.turn(p)] : []);
            (o.used(p) || []).forEach(([a, b]) => { holes += hole(p, a, b, sh(p)); });
          });
          if (out) out.people.forEach((q, i) => {
            const y = outY(i), a = X(Math.max(0, out.date - 3)), b = X(out.date);
            lives += '<g class="' + shadeOf(q) + '">' + ln(a, b, y, 'lv-line') + '</g>';
            holes += '<rect x="' + (a - 2).toFixed(1) + '" y="' + (y - PAD) + '" width="' + (b - a + 8).toFixed(1) + '" height="' + (2 * PAD) + '" rx="3"/>';
            over += '<g class="' + shadeOf(q) + '"><circle class="lv-no" cx="' + b.toFixed(1) + '" cy="' + y + '" r="4.4"/></g>';
          });
          // behind the lives, risk-set boxes: a tall narrow box at a case's date across every row (whoever is
          // still free there could have been its control); over the lives, onset dots, links, visits, checks, coins
          let back = '';
          // a small dot where diabetes really starts (none for someone who already had it when hired), whole, over both layers
          // someone who already had diabetes when hired: no dot, a word at the start of the line, haloed, over the start's upright
          people.forEach(p => { if (p.pre) over += tx(X(p.hired - sh(p)) + 6, rowY(p), w.had_it, 'lv-word lv-tag'); });
          people.forEach(p => { const t = onset(p); if (t != null && !p.pre) over += '<g class="' + shade(p)(t) + '"><circle class="lv-on" cx="' + X(t - sh(p)).toFixed(1) + '" cy="' + rowY(p) + '" r="3"/></g>'; });
          (o.boxes || []).forEach(t => { back += '<rect class="lv-box" x="' + (X(t) - 7).toFixed(1) + '" y="' + (TOP - 9) + '" width="14" height="' + (staffBottom - TOP + 6) + '" rx="4"/>'; });
          (o.links || []).forEach(([a, b, t]) => { over += '<line class="lv-link" x1="' + X(t).toFixed(1) + '" y1="' + rowY(by[a]) + '" x2="' + X(t).toFixed(1) + '" y2="' + rowY(by[b]) + '"/>'; });
          if (o.visits) people.forEach(p => o.visits(p).forEach(t => { const x = X(t - sh(p)), y = rowY(p); over += '<line class="lv-visit" x1="' + x.toFixed(1) + '" y1="' + (y - 6) + '" x2="' + x.toFixed(1) + '" y2="' + (y + 6) + '"/>'; }));
          // a follow-up design (cohort, trial) ends a life without diabetes in an open arrow, censored: no diabetes yet
          // when its follow-up stopped (2026 or moved); a death ends in an open dot, the status for good (Tonn,
          // 6 November 2026); a design that checks on a date (survey, case-control) draws an open dot
          const tipAt = (X, Y) => '<path class="lv-tip" d="M' + (X - 5).toFixed(1) + ' ' + (Y - 5.5) + ' L' + (X + 1.5).toFixed(1) + ' ' + Y + ' L' + (X - 5).toFixed(1) + ' ' + (Y + 5.5) + '"/>';
          (o.checks || []).forEach(([p, t, yes]) => { const cx = X(t - sh(p)), cy = rowY(p);
            over += '<g class="' + shade(p)(t) + '">' + (!yes && o.censor && p.why !== 'died' ? tipAt(cx, cy) : '<circle class="' + (yes ? 'lv-yes' : 'lv-no') + '" cx="' + cx.toFixed(1) + '" cy="' + cy + '" r="4.4"/>') + '</g>'; });
          if (o.coin) people.forEach(p => { const t = o.coin(p); if (t == null) return; const x = X(t), y = rowY(p); over += '<path class="lv-coin' + (o.arm && !o.arm(p) ? ' lv-coin-no' : '') + '" d="M' + x.toFixed(1) + ' ' + (y - 5) + ' L' + (x + 5).toFixed(1) + ' ' + y + ' L' + x.toFixed(1) + ' ' + (y + 5) + ' L' + (x - 5).toFixed(1) + ' ' + y + ' Z"/>'; });
          // the frame: rule, years (or years since joining), row numbers; the start on top
          let fr = tx(8, 14, fill(word('rule'), o.v), 'lv-hd');
          const ticks = zero ? [[0, '0'], [5, '5'], [T, w.zero]] : [[0, C.years[0]], [5, (C.years[0] + C.years[1]) / 2], [T, C.years[1]]];
          ticks.forEach(([t, s]) => { fr += tx(X(t), 36, s, 'muted', 'middle') + '<line class="tick" x1="' + X(t).toFixed(1) + '" y1="46" x2="' + X(t).toFixed(1) + '" y2="' + bottom + '"/>'; });
          people.forEach(p => { fr += tx(X0 - 12, rowY(p), String(p.id), 'lv-row', 'end'); });
          if (out) over += tx(8, outY(0) - 15, word('outside'), 'lv-kh lv-tag');
          let start = '';
          if (!zero && o.date != null) {
            const x = X(o.date), right = o.date > 5;
            start = '<path class="lv-tri" d="M' + (x - 6).toFixed(1) + ' 48 L' + (x + 6).toFixed(1) + ' 48 L' + x.toFixed(1) + ' 57 Z"/>'
              + '<line class="lv-date" x1="' + x.toFixed(1) + '" y1="57" x2="' + x.toFixed(1) + '" y2="' + bottom + '"/>'
              + tx(right ? x - 9 : x + 9, 53, word('date'), 'lv-k', right ? 'end' : 'start');
          }
          const defs = '<defs><clipPath id="' + id + '-clip">' + holes + '</clipPath><mask id="' + id + '-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="440" height="' + (bottom + 10) + '">'
            + '<rect x="0" y="0" width="440" height="' + (bottom + 10) + '" fill="white"/>' + holes.replace(/rx="3"\/>/g, 'rx="3" fill="black"/>') + '</mask></defs>';
          // the key, three columns: exposure (the shades), data (thick or thin), outcome
          // (the study's filled and open dots); then any of the design's own extras
          const glyph = {
            e: x => '<g class="lv-e">' + ln(x, x + 22, 0, 'lv-line') + '</g>', n: x => '<g class="lv-n">' + ln(x, x + 22, 0, 'lv-line') + '</g>',
            thick: x => '<g class="lv-0">' + ln(x, x + 22, 0, 'lv-line') + '</g>',
            thin: x => '<g class="lv-under lv-0">' + ln(x, x + 22, 0, 'lv-line') + '</g>',
            yes: x => '<g class="lv-e">' + ln(x, x + 7, 0, 'lv-line') + ln(x + 14, x + 25, 0, 'lv-line lv-ill lv-ill-k') + '<circle class="lv-yes" cx="' + (x + 9) + '" cy="0" r="4.6"/></g>',
            no: x => '<g class="lv-e">' + ln(x, x + 16, 0, 'lv-line') + '<circle class="lv-no" cx="' + (x + 18) + '" cy="0" r="4.6"/></g>',
            yet: x => '<g class="lv-e">' + ln(x, x + 16, 0, 'lv-line') + tipAt(x + 18, 0) + '</g>',
            link: x => '<line class="lv-link" x1="' + (x + 11) + '" y1="-7" x2="' + (x + 11) + '" y2="7"/>',
            box: x => '<rect class="lv-box" x="' + (x + 5) + '" y="-8" width="12" height="16" rx="3"/>',
            coin: x => '<path class="lv-coin" d="M' + (x + 11) + ' -5 L' + (x + 16) + ' 0 L' + (x + 11) + ' 5 L' + (x + 6) + ' 0 Z"/>',
            coin_no: x => '<path class="lv-coin lv-coin-no" d="M' + (x + 11) + ' -5 L' + (x + 16) + ' 0 L' + (x + 11) + ' 5 L' + (x + 6) + ' 0 Z"/>',
            visit: x => '<line class="lv-visit" x1="' + (x + 11) + '" y1="-6" x2="' + (x + 11) + '" y2="6"/>' };
          const item = (k, x, y, s) => '<g transform="translate(0 ' + y + ')">' + glyph[k](x) + '</g>' + tx(x + 30, y, s, 'lv-k');
          const cols = [[w.key_h_e, [['e', word('key_e')], ['n', word('key_ne')]]], [w.key_h_d, [['thick', w.key_data], ['thin', w.key_nodata]]],
            [w.key_h_o, o.censor ? [['yes', w.key_yes], ['no', w.key_no], ['yet', word('key_no')]] : [['yes', w.key_yes], ['no', word('key_no')]]]];
          const ky = bottom + 24;
          let key = '', ky2 = ky;
          cols.forEach(([head, rows], c) => {
            const x = 8 + c * 144;
            key += tx(x, ky, head, 'lv-kh');
            rows.forEach(([k, s], r) => { key += item(k, x, ky + 18 * (r + 1), s); ky2 = Math.max(ky2, ky + 18 * (r + 1)); });
          });
          const extra = [o.boxes && ['box', word('key_box')], o.links && ['link', w.key_link], o.coin && ['coin', word('key_coin')], o.arm && ['coin_no', word('key_coin_no')], o.visits && ['visit', w.key_visit]].filter(Boolean);
          // extras sit side by side, each after the last one's words (about 6.2 px a character at 11.5 px), wrapping
          // to a new row when the next would pass the edge (7 November 2026: two entries overlapped at fixed columns)
          if (extra.length) { ky2 += 22; let ex = 8; extra.forEach(([k, s]) => { const wd = 30 + s.length * 6.2; if (ex > 8 && ex + wd > 432) { ky2 += 18; ex = 8; } key += item(k, ex, ky2, s); ex += wd + 18; }); }
          const h = ky2 + 12;
          svg.setAttribute('viewBox', '0 0 440 ' + h);
          svg.setAttribute('aria-label', fill(word('svg_label'), o.v));
          // the thin layer is masked out of the used stretches, so a thick line never shows a thin one through its gaps
          svg.innerHTML = defs + fr + back + '<g class="lv-under" mask="url(#' + id + '-mask)">' + lives + '</g><g clip-path="url(#' + id + '-clip)">' + lives + '</g>' + start + over + key;
          const of = r => fill(w.of, { a: r[0], b: r[1], p: pc(r[0], r[1]) });
          // a cohort view with rate: true reads out rates (new cases per 100 person-years, the time from
          // joining to the case found or to leaving) and their ratio, instead of risks (Tonn, 6 November 2026)
          const q = o.rate || o.read, per = r => (r[0] / r[1] * 100).toFixed(1);
          const lab = (k, r) => esc(o.rate ? fill(word(k), { c: r[0], t: r[1].toFixed(1) }) : word(k));
          readout(at('read'), [{ value: o.rate ? per(q[0]) : of(q[0]), label: lab('r_e', q[0]) }, { value: o.rate ? per(q[1]) : of(q[1]), label: lab('r_ne', q[1]) },
            { value: ratio(q[0][0], q[0][1], q[1][0], q[1][1], o.odds), label: esc(word('r_ratio')), hl: true }]);
          at('note').textContent = fill(word('note'), o.v);
        };
        const contrast = () => {
          if (!d.contrast) return;
          const v = V[design], o = v.options || {};
          at('cl').textContent = v.switch || '';
          seg(at('ct'), Object.keys(o).map(k => ({ value: k, label: o[k] })), variant, x => { variant = x; draw(); }, v.switch);
          const box = at('clk');
          box.style.display = v.clock_options ? '' : 'none';
          if (v.clock_options) {
            at('kl').textContent = v.clock || '';
            seg(at('kt'), Object.keys(v.clock_options).map(k => ({ value: k, label: v.clock_options[k] })), clock, x => { clock = x; draw(); }, v.clock);
          }
        };
        if (keys.length > 1) seg(at('view'), keys.map(k => ({ value: k, label: V[k].label })), design, k => {
          design = k; variant = Object.keys(V[k].options || {})[0]; clock = 'calendar'; contrast(); draw();
        }, w.design);
        contrast(); draw();
      });
    }
  }

  const cnt = (a, f) => a.filter(f).length;
  const split = C => [C.people.filter(p => p.e), C.people.filter(p => !p.e)];
  // each design: who it uses and when (used), where it checks (checks), where it starts (date), its counts
  const DESIGNS = {
    // a survey on one day: who is present, and who has diabetes then
    survey(C, by, variant) {
      const t = variant === 'start' ? 0 : T, [E, N] = split(C), here = p => p.hired <= t && p.exit >= t && !(p.why && p.exit === t);
      const g = a => ({ n: cnt(a, here), c: cnt(a, p => here(p) && has(p, t)) }), ge = g(E), gn = g(N);
      return { date: t, boxes: [t], used: p => (here(p) ? [[t, t]] : []), checks: C.people.filter(here).map(p => [p, t, has(p, t)]),
        v: { n: ge.n + gn.n, total: C.people.length, c: ge.c + gn.c }, read: [[ge.c, ge.n], [gn.c, gn.n]] };
    },
    // a cohort: everyone free of diabetes when hired enters; a case counts once it is found, by the
    // study's own yearly test (prospective, from 2016) or at the next clinic visit on record (retrospective)
    cohort(C, by, variant, v) {
      // found: onset (the view's word) finds each case the day it starts, for a first, simple figure
      const [E, N] = split(C), rec = variant === 'records', found = p => {
        if (p.pre || p.on == null) return null;
        const f = v.found === 'onset' ? p.on : rec ? p.visits.find(t => t >= p.on) : Math.ceil(p.on);
        return f != null && f <= p.exit ? f : null;
      };
      const g = a => ({ n: cnt(a, p => !p.pre), c: cnt(a, p => found(p) != null) }), ge = g(E), gn = g(N);
      // person-years: each life from joining to its case found, or to leaving (2026, moved, died)
      const py = a => a.filter(p => !p.pre).reduce((s, p) => s + (found(p) != null ? found(p) : p.exit) - p.hired, 0);
      return { date: rec ? T : 0, rate: v.rate ? [[ge.c, py(E)], [gn.c, py(N)]] : null,
        used: p => (p.pre ? [] : [[p.hired, found(p) != null ? found(p) : p.exit]]),
        censor: true, checks: C.people.filter(p => !p.pre).map(p => (found(p) != null ? [p, found(p), true] : [p, p.exit, false])),
        visits: rec ? (p => (p.pre ? [] : p.visits.filter(t => t >= p.hired && t <= (found(p) != null ? found(p) : p.exit) && t !== found(p)))) : null,
        v: { n: ge.n + gn.n, total: C.people.length, c: ge.c + gn.c }, read: [[ge.c, ge.n], [gn.c, gn.n]] };
    },
    // a case-control study: the new cases as they are diagnosed, each with a control drawn on its date from
    // the staff still free then (the cases' own population), or controls from a health fair outside the
    // staff (variant fair; Tonn, 7 November 2026); either way it looks back three years for drinking
    cc(C, by, variant) {
      const [E, N] = split(C), when = {}, cs = new Set(), ct = new Set(), links = [], fair = variant === 'fair' ? C.cc.fair : null;
      C.cc.pairs.forEach(([a, b]) => { const t = by[a].on; cs.add(a); when[a] = t; if (!fair) { ct.add(b); when[b] = t; links.push([a, b, t]); } });
      const inn = p => cs.has(p.id) || ct.has(p.id), g = a => ({ n: cnt(a, p => cs.has(p.id)), c: cnt(a, p => ct.has(p.id)) }), ge = g(E), gn = g(N);
      const out = fair && fair.e.map(e => ({ e: !!e }));
      return { date: 0, boxes: C.cc.pairs.map(([a]) => by[a].on), links: fair ? null : links,
        outside: out ? { date: fair.date, people: out } : null,
        used: p => (inn(p) ? [[Math.max(p.hired, when[p.id] - 3), when[p.id]]] : []),
        checks: C.people.filter(inn).map(p => [p, when[p.id], cs.has(p.id)]),
        v: { n: cs.size, total: C.people.length, c: out ? out.length : ct.size },
        // the readout: the share of cases, and of controls, who drank daily, and the odds ratio
        read: [[ge.n, ge.n + gn.n], out ? [cnt(out, q => q.e), out.length] : [ge.c, ge.c + gn.c]], odds: true };
    },
    // a trial: people free of diabetes who agree; at a coin (or their own choice) on joining the trial,
    // max(hired, the trial's start), each is put in an arm, shown by the diamond (filled, the programme; open,
    // as usual). The rows stay the people's own, in id order as in every design: only the arms change, and with
    // them some outcomes (Tonn, 7 November 2026). The shade stays drinking, as in every design: the person's own
    // habit, until a drinker in the programme stops half a year after the coin. The programme works: for a
    // drinker in C.trial.cut, being in it puts their diabetes off past 2026. (A "Draw again" button that re-dealt the
    // arms was tried and dropped the same day: with 14 people the risk ratio swings from 0 to infinity.)
    trial(C, by, variant) {
      const tr = C.trial, arms = tr[variant] || tr.coin, t0 = tr.start || 0;
      const inA = new Set(arms.programme), inB = new Set(arms.none), cut = new Set(tr.cut || []);
      const people = C.people.map(p => (inA.has(p.id) && cut.has(p.id) ? Object.assign({}, p, { on: null }) : p)), P = {};
      people.forEach(p => { P[p.id] = p; });
      const A = arms.programme.map(i => P[i]), B = arms.none.map(i => P[i]);
      const coin = p => (inA.has(p.id) || inB.has(p.id) ? Math.max(p.hired, t0) : null);
      // a drinker in the programme stops tr.stop years after the coin, so their own habit shows first
      const stop = tr.stop || 0, turn = p => (p.e && inA.has(p.id) ? coin(p) + stop : null);
      const cases = a => cnt(a, p => p.on != null && p.on <= p.exit);
      return { date: t0, coin, arm: p => inA.has(p.id), people,
        turn, shade: p => t => (p.e && !(turn(p) != null && t >= turn(p)) ? 'lv-e' : 'lv-n'),
        used: p => (coin(p) == null ? [] : [[coin(p), p.on != null && p.on < p.exit ? p.on : p.exit]]),
        censor: true, checks: people.filter(p => coin(p) != null).map(p => (p.on != null && p.on < p.exit ? [p, p.on, true] : [p, p.exit, false])),
        v: { n: A.length + B.length, total: C.people.length, c: cnt(A, p => p.e) + cnt(B, p => p.e), de: cnt(A, p => p.e), dn: cnt(B, p => p.e) },
        read: [[cases(A), A.length], [cases(B), B.length]] };
    }
  };

  customElements.define('life-lines', LifeLines);
})();
