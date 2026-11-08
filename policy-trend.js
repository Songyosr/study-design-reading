/* <policy-trend>: an invented province's recorded new diagnoses of diabetes per 1,000 adults, one value
   a year from 2014 to 2025, with a sugar tax from 2020; read it as the average before 2020 against the
   average from 2020, or carry the trend of 2014 to 2019 forward, and tick a change in counting in the
   same year. Built on 7 November 2026 with Tonn; it replaced chapter 5's time figure
   (includes/describe/time-fig.html) and recorded-real (w15) in section 5.4. From the page's widget
   block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w15-v, w15-c, w15-svg, …)
     words                      view, means, trend (the switch); count (the tick); axis, tax, screen and
                                average ("{v}") (the figure); svg_means ("{values}", "{before}",
                                "{after}"), svg_trend ("{values}", "{end}", "{gap}") and svg_count (the
                                figure, for screen readers); legend, key_rec, key_mean, key_trend (the
                                key); before, after, diff, expected, recorded, gap (the readout); the
                                note's sentences: truth ("{slope}", "{drop}"), truth_count ("{lift}"),
                                then one of note_means, note_means_count, note_trend, note_trend_count
   Reuse: copy the block to reword it; the invented series (trend, tax, screening and wobble) is in this
   file. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, seg, readout } = K;
  class PolicyTrend extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-v-l">' + esc(w.view) + '</span><div class="terra-seg" id="' + id + '-v"></div></div>'
        + '<div class="chkrow"><label><input type="checkbox" id="' + id + '-c">' + esc(w.count) + '</label></div>'
        + '<svg class="fig-svg dz" id="' + id + '-svg" viewBox="0 0 440 276" role="img"></svg>'
        + '<ul class="legend" id="' + id + '-key" aria-label="' + esc(w.legend) + '"></ul>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<p class="terra-w-note" id="' + id + '-note" aria-live="polite"></p>');
      K.run('policy-trend', () => {
        /* the truth: 3.5 per 1,000 in 2014, rising 0.4 every year; the tax lowers every year from 2020 by 1.5; the tick's
           screening adds 1.8 to every recorded year from 2020. The wobble is fixed: it sums to 0 before 2020 and from 2020,
           and has no slope before 2020, so the line fitted to 2014-2019 is the true trend and the average gap is the -1.5. */
        const Y = []; for (let y = 2014; y <= 2025; y++) Y.push(y);
        const T0 = 2020, BASE = 3.5, SLOPE = 0.4, DROP = 1.5, LIFT = 1.8;
        const WOB = [-0.1, 0.1, 0.1, -0.2, 0.2, -0.1, 0.1, -0.1, 0.1, 0, -0.2, 0.1];
        const IX = Y.map((y, i) => i), pre = IX.filter(i => Y[i] < T0), post = IX.filter(i => Y[i] >= T0);
        const r1 = v => Math.round(v * 10) / 10, f1 = v => r1(v).toFixed(1), sg = v => (r1(v) < 0 ? '−' : '+') + Math.abs(r1(v)).toFixed(1);
        const avg = (f, ix) => ix.reduce((s, i) => s + f(i), 0) / ix.length;
        let view = 'means', count = false;
        seg(at('v'), [{ value: 'means', label: w.means }, { value: 'trend', label: w.trend }], view, v => { view = v; render(); }, w.view);
        at('c').addEventListener('change', e => { count = e.target.checked; render(); });
        /* 440 wide and 0 to 10 per 1,000, in chapter 5's figure style (axis, grid, slate line without dots) */
        const x0 = 40, x1 = 430, top = 50, h = 200, vmax = 10;
        const X = i => x0 + 12 + i * (x1 - x0 - 24) / (Y.length - 1), V = v => top + h - h * v / vmax;
        const xm = (X(pre[pre.length - 1]) + X(post[0])) / 2, n = v => v.toFixed(1);
        function bar(ix, v, cls) { // an average: a bar across the years it covers, with an end tick at each side
          const a = X(ix[0]), b = X(ix[ix.length - 1]), y = V(v);
          return '<path class="' + cls + '" fill="none" d="M' + n(a) + ' ' + n(y - 5) + 'V' + n(y + 5) + 'M' + n(a) + ' ' + n(y) + 'H' + n(b) + 'M' + n(b) + ' ' + n(y - 5) + 'V' + n(y + 5) + '"/>'
            + '<text class="knock" x="' + n(a) + '" y="' + n(y - 9) + '">' + esc(K.fill(w.average, { v: f1(v) })) + '</text>';
        }
        function render() {
          const rec = Y.map((y, i) => r1(BASE + SLOPE * i + WOB[i] - (y >= T0 ? DROP : 0) + (count && y >= T0 ? LIFT : 0)));
          const mx = avg(i => i, pre), my = avg(i => rec[i], pre);
          const b = pre.reduce((s, i) => s + (i - mx) * (rec[i] - my), 0) / pre.reduce((s, i) => s + (i - mx) * (i - mx), 0), fit = i => my + b * (i - mx);
          const before = avg(i => rec[i], pre), after = avg(i => rec[i], post), expected = avg(fit, post), gap = after - expected;
          let s = '<text class="muted" x="10" y="14">' + esc(w.axis) + '</text>';
          [0, 2, 4, 6, 8, 10].forEach(t => { s += '<line class="tick" x1="' + (x0 - 6) + '" y1="' + n(V(t)) + '" x2="' + x1 + '" y2="' + n(V(t)) + '"/><text class="muted" x="' + (x0 - 12) + '" y="' + n(V(t)) + '" text-anchor="end" dy=".35em">' + t + '</text>'; });
          Y.forEach((y, i) => { if (y % 2 === 0) s += '<text class="muted" x="' + n(X(i)) + '" y="' + (top + h + 16) + '" text-anchor="middle">' + y + '</text>'; });
          s += '<line class="axis" x1="' + x0 + '" y1="' + V(0) + '" x2="' + x1 + '" y2="' + V(0) + '"/>';
          s += '<line class="policy" x1="' + n(xm) + '" y1="' + (top - 14) + '" x2="' + n(xm) + '" y2="' + V(0) + '"/>';
          (count ? [w.tax, w.screen] : [w.tax]).forEach((t, k, all) => { s += '<text x="' + n(xm + 5) + '" y="' + (top - 8 - 14 * (all.length - 1 - k)) + '">' + esc(t) + '</text>'; });
          if (view === 'means') s += bar(pre, before, 'est') + bar(post, after, 'est');
          else s += '<line class="ln-true" x1="' + n(X(0)) + '" y1="' + n(V(fit(0))) + '" x2="' + n(X(Y.length - 1)) + '" y2="' + n(V(fit(Y.length - 1))) + '"/>';
          s += '<polyline class="series" points="' + rec.map((v, i) => n(X(i)) + ',' + n(V(v))).join(' ') + '"/>';
          const svg = at('svg'); svg.innerHTML = '<g class="p2">' + s + '</g>';
          const values = Y.map((y, i) => y + ' ' + f1(rec[i])).join(', ');
          svg.setAttribute('aria-label', (view === 'means' ? K.fill(w.svg_means, { values, before: f1(before), after: f1(after) }) : K.fill(w.svg_trend, { values, end: f1(fit(Y.length - 1)), gap: sg(gap) })) + (count ? ' ' + w.svg_count : ''));
          const sw = mark => '<svg class="dz" width="26" height="12" aria-hidden="true"><g class="p2">' + mark + '</g></svg>';
          at('key').innerHTML = '<li>' + sw('<line class="series" x1="2" y1="6" x2="24" y2="6"/>') + esc(w.key_rec) + '</li>'
            + (view === 'means' ? '<li>' + sw('<path class="est" fill="none" d="M2 2V10M2 6H24M24 2V10"/>') + esc(w.key_mean) + '</li>'
              : '<li>' + sw('<line class="ln-true" x1="1" y1="6" x2="25" y2="6"/>') + esc(w.key_trend) + '</li>');
          if (view === 'means') readout(at('read'), [{ value: f1(before), label: esc(w.before) }, { value: f1(after), label: esc(w.after) }, { value: sg(after - before), label: esc(w.diff), hl: true }]);
          else readout(at('read'), [{ value: f1(expected), label: esc(w.expected) }, { value: f1(after), label: esc(w.recorded) }, { value: sg(gap), label: esc(w.gap), hl: true }]);
          at('note').textContent = [K.fill(w.truth, { slope: f1(SLOPE), drop: f1(DROP) }), count ? K.fill(w.truth_count, { lift: f1(LIFT) }) : '',
            w['note_' + view + (count ? '_count' : '')]].filter(Boolean).join(' ');
        }
        render();
      });
    }
  }
  if (!customElements.get('policy-trend')) customElements.define('policy-trend', PolicyTrend);
})();
