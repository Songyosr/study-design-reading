/* <age-mix>: crude or age-standardised? Hogwarts and PSU, each one bar of the same width, split into two
   age groups (under 50, 50 and over). A part's width is that group's share of the place's adults; it fills
   from the bottom to the group's share with diabetes (one scale, 0 to 20%, for both bars), so the filled
   area shows the place's overall share. A switch gives both bars one shared age mix, both places
   combined: the heights stay, only the widths move, and the readout turns from crude to age-standardised.
   Built on 7 November 2026 from a sketch agreed with Tonn; it replaced place-compare (w7) and chapter 5's
   static person figure (includes/describe/person-fig.html). From the page's widget
   block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w7-mix, w7-svg, w7-read, …)
     words                      mix (the control's label and group); own, shared (the buttons);
                                place_a, place_b (the places' names); young, old (the age groups);
                                head_own ({place}, {n}) and head_shared ({place}) (each bar's heading);
                                of_adults and in_mix ({pct}) (a part's width); key and legend (the key);
                                svg_label and svg_final ({mix}, {a_wy}, {a_y}, {a_wo}, {a_o}, the same
                                with b_, {a}, {b}) (the figure, for screen readers); crude, std ({kind}),
                                share ({place}, {kind}), ratio ({kind}) (the readout); note_own ({a_y},
                                {b_y}, {a_o}, {b_o}, {a_old}, {b_old}) and note_shared ({young}, {old},
                                {a_o}, {b_o}) (the note)
   The invented numbers (place-compare's, the same as the slides) are here; the notes fill theirs in from them.
   Reuse: copy the block to reword it; the invented numbers for the two places are in this file. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, seg, readout, pct1 } = K;
  class AgeMix extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-mix-l">' + esc(w.mix) + '</span><div class="terra-seg" id="' + id + '-mix"></div></div>'
        + '<svg class="fig-svg" id="' + id + '-svg" role="img" aria-label="' + esc(w.svg_label) + '" style="max-width:440px;margin-inline:auto"></svg>'
        + '<ul class="legend" aria-label="' + esc(w.legend) + '"><li><svg width="12" height="12" aria-hidden="true"><rect x="1" y="1" width="10" height="10" class="d-case"/></svg>' + esc(w.key) + '</li></ul>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<p class="terra-w-note" id="' + id + '-note" aria-live="polite"></p>');
      K.run('age-mix', () => {
        /* invented age make-up, the same as place-compare's and the slides': under 50 and 50 or older, with the
           people who have diabetes in each (cy, co); the shared mix (the standard) = both places combined */
        const D = { A: { name: w.place_a, n: 400, young: 160, old: 240, cy: 8, co: 40 }, B: { name: w.place_b, n: 2000, young: 1400, old: 600, cy: 70, co: 90 } };
        const SY = D.A.young + D.B.young, SO = D.A.old + D.B.old;
        const ry = p => p.cy / p.young, ro = p => p.co / p.old, pc = v => Math.round(v * 100) + '%';
        let mix = 'own';
        seg(at('mix'), [{ value: 'own', label: w.own }, { value: 'shared', label: w.shared }], mix, v => { mix = v; render(); }, w.mix);
        function render() {
          /* a place's share under 50 (the width of its first part): its own, or the shared mix's; the overall share is the
             width-weighted average of the two heights, so the crude share with its own mix, the standardised with the shared */
          const wy = k => mix === 'own' ? D[k].young / D[k].n : SY / (SY + SO), val = k => wy(k) * ry(D[k]) + (1 - wy(k)) * ro(D[k]);
          const W = 340, x0 = 28, x1 = W - 2, bw = x1 - x0, H = 88, max = 0.2;
          let s = '';
          [['A', 0], ['B', 162]].forEach(r => {
            const k = r[0], t = r[1], p = D[k], cT = t + 60, cB = cT + H, xs = x0 + wy(k) * bw;
            s += '<text class="strong" x="0" y="' + (t + 13) + '">' + esc(mix === 'own' ? K.fill(w.head_own, { place: p.name, n: p.n.toLocaleString('en-US') }) : K.fill(w.head_shared, { place: p.name })) + '</text>';
            s += '<rect x="' + x0 + '" y="' + cT + '" width="' + bw + '" height="' + H + '" style="fill:var(--data-band)"/>';
            [[w.young, x0, wy(k), ry(p)], [w.old, xs, 1 - wy(k), ro(p)]].forEach(q => {
              const pw = q[2] * bw, fh = q[3] / max * H, cx = (q[1] + pw / 2).toFixed(1);
              s += '<rect class="d-case" x="' + q[1].toFixed(1) + '" y="' + (cB - fh).toFixed(1) + '" width="' + pw.toFixed(1) + '" height="' + fh.toFixed(1) + '"/>';
              s += '<text class="strong" x="' + cx + '" y="' + (cB - fh - 5).toFixed(1) + '" text-anchor="middle">' + pct1(q[3]) + '</text>';
              s += '<text x="' + cx + '" y="' + (t + 35) + '" text-anchor="middle">' + esc(q[0]) + '</text>';
              s += '<text class="mono" x="' + cx + '" y="' + (t + 50) + '" text-anchor="middle">' + esc(K.fill(mix === 'own' ? w.of_adults : w.in_mix, { pct: pc(q[2]) })) + '</text>';
            });
            s += '<line x1="' + xs.toFixed(1) + '" y1="' + cT + '" x2="' + xs.toFixed(1) + '" y2="' + cB + '" style="stroke:var(--paper);stroke-width:2"/>';
            s += '<line class="axis" x1="' + x0 + '" y1="' + cB + '" x2="' + x1 + '" y2="' + cB + '"/>';
            s += '<text class="mono" x="' + (x0 - 5) + '" y="' + (cT + 8) + '" text-anchor="end">' + pc(max) + '</text><text class="mono" x="' + (x0 - 5) + '" y="' + cB + '" text-anchor="end">0</text>';
          });
          const svg = at('svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (162 + 60 + H + 4)); svg.innerHTML = s;
          const a = val('A'), b = val('B'), kind = mix === 'own' ? w.crude : w.std;
          readout(at('read'), [{ value: pct1(a), label: esc(K.fill(w.share, { place: D.A.name, kind })) }, { value: pct1(b), label: esc(K.fill(w.share, { place: D.B.name, kind })) }, { value: (a / b).toFixed(mix === 'own' ? 1 : 2), label: esc(K.fill(w.ratio, { kind })), hl: true }]);
          at('note').textContent = mix === 'own'
            ? K.fill(w.note_own, { a_y: pct1(ry(D.A)), b_y: pct1(ry(D.B)), a_o: pct1(ro(D.A)), b_o: pct1(ro(D.B)), a_old: pc(D.A.old / D.A.n), b_old: pc(D.B.old / D.B.n) })
            : K.fill(w.note_shared, { young: SY.toLocaleString('en-US'), old: SO, a_o: pct1(ro(D.A)), b_o: pct1(ro(D.B)) });
          svg.setAttribute('aria-label', K.fill(w.svg_final, { mix: mix === 'own' ? w.own : w.shared, a_wy: pc(wy('A')), a_y: pct1(ry(D.A)), a_wo: pc(1 - wy('A')), a_o: pct1(ro(D.A)), b_wy: pc(wy('B')), b_y: pct1(ry(D.B)), b_wo: pc(1 - wy('B')), b_o: pct1(ro(D.B)), a: pct1(a), b: pct1(b) }));
        }
        render();
      });
    }
  }
  if (!customElements.get('age-mix')) customElements.define('age-mix', AgeMix);
})();
