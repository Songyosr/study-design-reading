/* <hotspot-check>: "Is the hotspot real?" Chapter 5's invented province of eight districts, shaded by one
   survey's share of adults with diabetes, or the same survey as a funnel plot; draw another survey and watch
   which districts stay high. Built 7 November 2026 with Tonn; it replaced chapter 5's place map (includes/describe/place-fig.html)
   and widget 14 (small-numbers, whose pooling went to the estimation card). From the page's
   widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w14-v, w14-next, w14-svg, w14-read, …)
     words                      view, map and funnel (the switch); next (the button); districts (the eight
                                names, in this file's order); name_share ("{name}", "{share}") and examined
                                ("{n}") (the map's labels); key_title and key_steps (four, the map's key);
                                map_label ("{k}", "{list}"), map_item ("{name}", "{share}", "{n}") and item_sep
                                (the map, for screen readers); axis_x, axis_y, key_mid ("{share}"), key_lim and
                                key_unit (the funnel); funnel_label ("{k}", "{share}", "{above}");
                                highest and highest_tied ("{name}", "{n}"), above, none and list_sep (the
                                readout); survey ("{k}") and note ("{west}", "{rest}") (the note)
   Here: how many each district examined, the true shares (Town and Harbour on the west coast 14%, the other
   six 6%), the key's steps (8, 11 and 14%), the seed, and the shapes and label places copied from
   place-fig.html (drawn by units/study-design/scripts/make_describe_figs.py). Survey k draws every examined
   adult again, with diabetes at their district's true share, from mulberry32(seed + 31k), so everyone sees
   the same surveys in the same order. The funnel's centre is the survey's share over all districts; its upper 95%
   limit is 1.96 standard errors above it (normal approximation). Only the upper limit is drawn (Tonn, 7 November
   2026): the question is "higher than chance?", and a lower limit would flag the ordinary districts, which the
   west coast pulls below the province's share.
   Reuse: copy the block to reword it; the districts, the truth, the steps and the seed are in this file. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, seg, readout, mulberry32, pct1 } = K;
  const N = [640, 420, 300, 380, 180, 220, 260, 60], WEST = 0.14, REST = 0.06, P = N.map((_, i) => (i < 2 ? WEST : REST));
  const SEED = 17141782, STEPS = [0.08, 0.11, 0.14], Z = 1.96;
  // from place-fig.html (make_describe_figs.py, 3 November 2026): the map group transform, the eight districts
  // in order, the two coastlines, and each label anchor [x, y of the name line, centred (1) or from the left (0)]
  const MAP_AT = "translate(8 -18) scale(1.04)";
  const SHAPES = ["M159.2,209.5 L150.0,201.2 L143.2,190.7 L134.2,182.0 L123.1,176.3 L113.1,169.3 L102.3,163.5 L92.4,156.2 L82.0,149.7 L80.9,146.5 L78.5,142.4 L76.5,138.1 L75.9,134.0 L77.2,130.1 L79.9,126.5 L82.9,123.1 L85.2,119.6 L86.4,115.8 L87.1,111.7 L87.9,107.6 L89.4,103.7 L91.3,100.9 L103.2,102.6 L114.4,107.1 L123.7,114.7 L134.5,120.1 L146.2,121.5 L158.1,122.0 L169.2,126.6 L181.1,127.7 L180.7,135.8 L178.9,143.7 L179.1,151.9 L180.5,159.9 L179.7,168.0 L179.4,176.1 L181.4,184.0 L182.7,192.0 L180.0,194.6 L177.7,197.5 L174.4,199.2 L171.7,201.7 L169.0,204.3 L166.1,206.7 L162.8,208.4 Z", "M148.0,262.0 L147.1,261.9 L141.6,261.4 L135.4,261.6 L128.4,262.4 L121.1,263.1 L114.4,262.8 L108.7,261.0 L104.5,257.8 L101.3,253.8 L98.2,249.7 L94.6,246.2 L90.3,243.1 L85.6,240.3 L81.2,237.0 L77.8,233.2 L75.4,228.9 L73.3,224.5 L70.9,220.3 L67.6,216.5 L63.8,212.7 L60.5,208.8 L58.8,204.2 L59.4,199.1 L62.0,193.7 L65.6,188.3 L69.1,183.2 L71.6,178.6 L73.0,174.2 L74.1,170.0 L75.6,165.9 L77.7,161.9 L80.2,158.0 L82.0,154.2 L82.3,150.5 L82.0,149.7 L92.4,156.2 L102.3,163.5 L113.1,169.3 L123.1,176.3 L134.2,182.0 L143.2,190.7 L150.0,201.2 L159.2,209.5 L159.6,216.3 L159.2,223.1 L157.4,229.6 L155.2,236.1 L151.8,242.0 L150.2,248.7 L149.2,255.4 Z", "M259.0,207.7 L249.3,206.4 L239.5,206.2 L230.0,203.7 L220.4,202.1 L211.1,198.7 L202.4,193.9 L192.6,191.7 L182.7,192.0 L181.4,184.0 L179.4,176.1 L179.7,168.0 L180.5,159.9 L179.1,151.9 L178.9,143.7 L180.7,135.8 L181.1,127.7 L188.2,123.6 L195.7,120.0 L202.9,116.1 L209.8,111.6 L217.2,108.0 L224.7,104.3 L231.1,99.2 L237.8,94.4 L243.7,101.9 L250.1,109.1 L258.1,114.5 L264.4,121.8 L269.3,130.2 L274.4,138.5 L282.1,144.4 L289.5,150.7 L284.1,156.8 L280.5,164.2 L276.6,171.3 L272.2,178.1 L268.9,185.7 L268.2,194.0 L263.1,200.5 Z", "M283.9,269.2 L282.4,270.4 L277.7,272.6 L272.2,273.1 L266.1,272.3 L260.1,270.9 L254.5,269.9 L249.4,270.1 L244.6,271.3 L239.9,272.9 L235.1,274.1 L230.0,274.4 L225.0,274.1 L220.0,273.6 L215.0,273.8 L210.0,274.7 L204.9,275.8 L199.7,276.4 L194.7,275.5 L190.0,273.1 L185.8,269.7 L181.8,266.4 L177.6,264.0 L173.1,263.0 L168.0,263.0 L162.7,263.3 L157.3,263.3 L152.2,262.7 L148.0,262.0 L149.2,255.4 L150.2,248.7 L151.8,242.0 L155.2,236.1 L157.4,229.6 L159.2,223.1 L159.6,216.3 L159.2,209.5 L162.8,208.4 L166.1,206.7 L169.0,204.3 L171.7,201.7 L174.4,199.2 L177.7,197.5 L180.0,194.6 L182.7,192.0 L192.6,191.7 L202.4,193.9 L211.1,198.7 L220.4,202.1 L230.0,203.7 L239.5,206.2 L249.3,206.4 L259.0,207.7 L261.7,215.5 L265.0,223.2 L269.3,230.3 L272.6,237.9 L273.9,246.2 L276.9,254.1 L281.6,261.1 Z", "M181.1,127.7 L169.2,126.6 L158.1,122.0 L146.2,121.5 L134.5,120.1 L123.7,114.7 L114.4,107.1 L103.2,102.6 L91.3,100.9 L91.8,100.2 L94.5,96.7 L96.5,93.0 L97.4,88.5 L97.4,83.3 L97.4,77.8 L98.4,72.6 L101.0,68.4 L105.2,65.5 L110.4,63.5 L115.8,61.8 L120.7,59.9 L125.3,57.6 L129.7,55.2 L134.5,53.3 L139.9,52.2 L145.5,51.7 L150.9,51.1 L155.7,49.7 L159.8,46.9 L163.5,43.0 L167.4,38.8 L171.8,35.4 L176.8,33.3 L182.2,32.6 L187.8,32.6 L193.3,32.5 L198.7,31.8 L204.1,30.7 L209.5,29.8 L215.0,29.8 L220.5,30.8 L225.8,32.4 L231.1,33.7 L236.4,33.9 L242.1,32.8 L248.2,31.1 L251.0,30.4 L248.5,38.2 L246.7,46.2 L244.5,54.1 L241.6,61.8 L241.6,70.1 L242.0,78.3 L241.2,86.7 L237.8,94.4 L231.1,99.2 L224.7,104.3 L217.2,108.0 L209.8,111.6 L202.9,116.1 L195.7,120.0 L188.2,123.6 Z", "M289.5,150.7 L282.1,144.4 L274.4,138.5 L269.3,130.2 L264.4,121.8 L258.1,114.5 L250.1,109.1 L243.7,101.9 L237.8,94.4 L241.2,86.7 L242.0,78.3 L241.6,70.1 L241.6,61.8 L244.5,54.1 L246.7,46.2 L248.5,38.2 L251.0,30.4 L254.4,29.6 L260.3,29.4 L265.8,30.9 L270.6,33.7 L275.1,37.1 L279.4,40.4 L283.7,43.4 L287.9,46.5 L291.6,50.1 L294.3,54.7 L296.2,60.1 L297.5,65.7 L299.1,70.5 L301.6,74.1 L305.3,76.5 L309.7,78.3 L314.0,80.2 L317.5,82.9 L320.1,86.3 L322.0,90.0 L323.9,93.6 L326.6,96.8 L329.8,99.6 L333.1,102.5 L335.8,105.8 L337.2,109.5 L337.9,113.5 L338.7,117.4 L340.7,120.8 L344.7,123.7 L350.3,126.4 L356.7,129.3 L362.5,132.5 L367.0,136.2 L370.1,140.3 L370.3,140.6 L360.1,138.3 L349.7,138.8 L339.6,141.3 L329.2,140.5 L318.9,141.5 L308.6,142.8 L299.2,147.1 Z", "M380.2,158.0 L381.8,162.7 L381.5,167.5 L379.2,172.0 L375.6,176.4 L372.0,180.5 L369.4,184.7 L368.3,189.1 L368.3,193.7 L368.2,198.5 L367.1,203.0 L364.6,207.2 L361.1,210.9 L357.5,214.5 L354.3,218.3 L351.7,222.2 L348.9,226.0 L345.2,229.4 L340.1,231.9 L333.9,233.5 L327.2,234.6 L321.3,235.9 L316.8,237.9 L313.6,241.0 L311.1,244.8 L308.6,248.7 L305.4,252.2 L301.6,255.0 L297.5,257.5 L293.5,260.2 L289.9,263.5 L286.3,267.1 L283.9,269.2 L281.6,261.1 L276.9,254.1 L273.9,246.2 L272.6,237.9 L269.3,230.3 L265.0,223.2 L261.7,215.5 L259.0,207.7 L263.1,200.5 L268.2,194.0 L268.9,185.7 L272.2,178.1 L276.6,171.3 L280.5,164.2 L284.1,156.8 L289.5,150.7 L299.2,147.1 L308.6,142.8 L318.9,141.5 L329.2,140.5 L339.6,141.3 L349.7,138.8 L360.1,138.3 L370.3,140.6 L372.4,144.5 L374.8,148.9 L377.6,153.4 Z", "M53.0,288.0 L55.6,290.3 L54.6,292.5 L51.0,293.8 L47.8,294.6 L45.9,295.8 L43.9,297.1 L40.9,297.0 L38.1,295.9 L36.0,295.4 L33.7,296.8 L30.2,298.6 L26.7,298.7 L24.5,297.1 L23.1,295.2 L21.0,293.8 L18.8,292.2 L18.9,290.0 L21.8,288.0 L24.8,286.7 L25.2,285.4 L24.0,283.4 L23.9,281.2 L25.8,279.9 L28.3,279.1 L30.3,277.5 L32.7,275.4 L36.0,274.6 L39.1,276.3 L40.9,279.0 L42.3,280.7 L44.6,281.2 L47.0,281.8 L48.0,283.4 L48.1,285.1 L49.6,286.4 Z"];
  const COAST = ["M380.2,158.0 L381.8,162.7 L381.5,167.5 L379.2,172.0 L375.6,176.4 L372.0,180.5 L369.4,184.7 L368.3,189.1 L368.3,193.7 L368.2,198.5 L367.1,203.0 L364.6,207.2 L361.1,210.9 L357.5,214.5 L354.3,218.3 L351.7,222.2 L348.9,226.0 L345.2,229.4 L340.1,231.9 L333.9,233.5 L327.2,234.6 L321.3,235.9 L316.8,237.9 L313.6,241.0 L311.1,244.8 L308.6,248.7 L305.4,252.2 L301.6,255.0 L297.5,257.5 L293.5,260.2 L289.9,263.5 L286.3,267.1 L282.4,270.4 L277.7,272.6 L272.2,273.1 L266.1,272.3 L260.1,270.9 L254.5,269.9 L249.4,270.1 L244.6,271.3 L239.9,272.9 L235.1,274.1 L230.0,274.4 L225.0,274.1 L220.0,273.6 L215.0,273.8 L210.0,274.7 L204.9,275.8 L199.7,276.4 L194.7,275.5 L190.0,273.1 L185.8,269.7 L181.8,266.4 L177.6,264.0 L173.1,263.0 L168.0,263.0 L162.7,263.3 L157.3,263.3 L152.2,262.7 L147.1,261.9 L141.6,261.4 L135.4,261.6 L128.4,262.4 L121.1,263.1 L114.4,262.8 L108.7,261.0 L104.5,257.8 L101.3,253.8 L98.2,249.7 L94.6,246.2 L90.3,243.1 L85.6,240.3 L81.2,237.0 L77.8,233.2 L75.4,228.9 L73.3,224.5 L70.9,220.3 L67.6,216.5 L63.8,212.7 L60.5,208.8 L58.8,204.2 L59.4,199.1 L62.0,193.7 L65.6,188.3 L69.1,183.2 L71.6,178.6 L73.0,174.2 L74.1,170.0 L75.6,165.9 L77.7,161.9 L80.2,158.0 L82.0,154.2 L82.3,150.5 L80.9,146.5 L78.5,142.4 L76.5,138.1 L75.9,134.0 L77.2,130.1 L79.9,126.5 L82.9,123.1 L85.2,119.6 L86.4,115.8 L87.1,111.7 L87.9,107.6 L89.4,103.7 L91.8,100.2 L94.5,96.7 L96.5,93.0 L97.4,88.5 L97.4,83.3 L97.4,77.8 L98.4,72.6 L101.0,68.4 L105.2,65.5 L110.4,63.5 L115.8,61.8 L120.7,59.9 L125.3,57.6 L129.7,55.2 L134.5,53.3 L139.9,52.2 L145.5,51.7 L150.9,51.1 L155.7,49.7 L159.8,46.9 L163.5,43.0 L167.4,38.8 L171.8,35.4 L176.8,33.3 L182.2,32.6 L187.8,32.6 L193.3,32.5 L198.7,31.8 L204.1,30.7 L209.5,29.8 L215.0,29.8 L220.5,30.8 L225.8,32.4 L231.1,33.7 L236.4,33.9 L242.1,32.8 L248.2,31.1 L254.4,29.6 L260.3,29.4 L265.8,30.9 L270.6,33.7 L275.1,37.1 L279.4,40.4 L283.7,43.4 L287.9,46.5 L291.6,50.1 L294.3,54.7 L296.2,60.1 L297.5,65.7 L299.1,70.5 L301.6,74.1 L305.3,76.5 L309.7,78.3 L314.0,80.2 L317.5,82.9 L320.1,86.3 L322.0,90.0 L323.9,93.6 L326.6,96.8 L329.8,99.6 L333.1,102.5 L335.8,105.8 L337.2,109.5 L337.9,113.5 L338.7,117.4 L340.7,120.8 L344.7,123.7 L350.3,126.4 L356.7,129.3 L362.5,132.5 L367.0,136.2 L370.1,140.3 L372.4,144.5 L374.8,148.9 L377.6,153.4 Z", "M53.0,288.0 L55.6,290.3 L54.6,292.5 L51.0,293.8 L47.8,294.6 L45.9,295.8 L43.9,297.1 L40.9,297.0 L38.1,295.9 L36.0,295.4 L33.7,296.8 L30.2,298.6 L26.7,298.7 L24.5,297.1 L23.1,295.2 L21.0,293.8 L18.8,292.2 L18.9,290.0 L21.8,288.0 L24.8,286.7 L25.2,285.4 L24.0,283.4 L23.9,281.2 L25.8,279.9 L28.3,279.1 L30.3,277.5 L32.7,275.4 L36.0,274.6 L39.1,276.3 L40.9,279.0 L42.3,280.7 L44.6,281.2 L47.0,281.8 L48.0,283.4 L48.1,285.1 L49.6,286.4 Z"];
  const LABEL_AT = [[149, 132, 1], [126, 192, 1], [248, 136, 1], [230, 222, 1], [192, 61, 1], [310, 77, 1], [338, 178, 1], [81, 277, 0]];
  class HotspotCheck extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-v-l">' + esc(w.view) + '</span><div class="terra-seg" id="' + id + '-v"></div></div>'
        + '<div class="terra-w-controls"><button class="btn is-primary" id="' + id + '-next" type="button">' + esc(w.next) + '</button></div>'
        + '<svg class="fig-svg dz lf" id="' + id + '-svg" role="img"></svg>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<p class="terra-w-note" id="' + id + '-note" aria-live="polite"></p>');
      K.run('hotspot-check', () => {
        const names = K.list(w.districts), steps = K.list(w.key_steps), sep = w.list_sep, TOT = N.reduce((a, b) => a + b);
        let k = 1, view = 'map'; const done = {};
        // survey k: each examined adult has diabetes with their district's true share
        function survey(t) {
          if (done[t]) return done[t];
          const r = mulberry32(SEED + t * 31), cases = N.map((n, i) => { let c = 0; for (let j = 0; j < n; j++) if (r() < P[i]) c++; return c; });
          const pool = cases.reduce((a, b) => a + b) / TOT, half = n => Z * Math.sqrt(pool * (1 - pool) / n);
          const share = cases.map((c, i) => c / N[i]);
          const side = share.map((s, i) => (s > pool + half(N[i]) ? 1 : s < pool - half(N[i]) ? -1 : 0));
          return (done[t] = { cases, share, pool, half, side });
        }
        const shade = s => 'ch' + (1 + STEPS.filter(b => s >= b).length);
        function drawMap(v) {
          let s = '<g transform="' + MAP_AT + '">';
          SHAPES.forEach((p, i) => { s += '<path class="dist ' + shade(v.share[i]) + '" d="' + p + '"/>'; });
          COAST.forEach(p => { s += '<path class="coast" d="' + p + '"/>'; });
          s += '</g>';
          LABEL_AT.forEach(([x, y, mid], i) => {
            const a = mid ? ' text-anchor="middle"' : '';
            s += '<text class="strong knock" x="' + x + '" y="' + y + '"' + a + '>' + esc(K.fill(w.name_share, { name: names[i], share: pct1(v.share[i]) })) + '</text>'
              + '<text class="muted knock" x="' + x + '" y="' + (y + 15) + '"' + a + '>' + esc(K.fill(w.examined, { n: N[i].toLocaleString('en-US') })) + '</text>';
          });
          s += '<text class="muted" x="10" y="346">' + esc(w.key_title) + '</text>';
          steps.forEach((t, i) => { s += '<rect class="dist sw ch' + (i + 1) + '" x="' + (10 + i * 104) + '" y="356" width="20" height="14" rx="2"/><text x="' + (36 + i * 104) + '" y="363" dy=".35em">' + esc(t) + '</text>'; });
          return { box: '0 0 440 380', svg: s, label: K.fill(w.map_label, { k, list: N.map((n, i) => K.fill(w.map_item, { name: names[i], share: pct1(v.share[i]), n: n.toLocaleString('en-US') })).join(w.item_sep) }) };
        }
        function drawFunnel(v) {
          const x0 = 40, x1 = 348, yT = 26, yB = 266, top = Math.max(0.2, Math.ceil(Math.max(...v.share) * 20) / 20);
          const X = K.linear(0, 700, x0, x1), Y = K.linear(0, top, yB, yT); let s = '';
          for (let t = 0.05; t <= top + 1e-9; t += 0.05) s += '<line class="tick" x1="' + x0 + '" y1="' + Y(t).toFixed(1) + '" x2="' + x1 + '" y2="' + Y(t).toFixed(1) + '"/>';
          for (let t = 0; t <= top + 1e-9; t += 0.05) s += '<text class="muted" x="' + (x0 - 6) + '" y="' + Y(t).toFixed(1) + '" text-anchor="end" dy=".35em">' + Math.round(t * 100) + '%</text>';
          s += K.axis(x0, x1, yB, [0, 200, 400, 600].map(n => ({ x: X(n), label: n })));
          s += '<text class="muted" x="' + (x0 - 30) + '" y="12">' + esc(w.axis_y) + '</text><text class="muted" x="' + x1 + '" y="302" text-anchor="end">' + esc(w.axis_x) + '</text>';
          // the upper 95% limit only, drawn where it falls inside the chart: the question is whether a district is higher than chance allows
          [1].forEach(sg => {
            const pts = []; for (let n = 20; n <= 700; n += n < 120 ? 2 : 10) { const y = v.pool + sg * v.half(n); if (y >= 0 && y <= top) pts.push(X(n).toFixed(1) + ',' + Y(y).toFixed(1)); }
            s += '<polyline class="fn-lim" points="' + pts.join(' ') + '"/>';
          });
          s += '<line class="ref-heading" x1="' + x0 + '" y1="' + Y(v.pool).toFixed(1) + '" x2="' + x1 + '" y2="' + Y(v.pool).toFixed(1) + '"/>';
          // each district a square; its name beside it, nudged up or down until no name covers another or a square
          const sq = N.map((n, i) => ({ x: X(n), y: Y(v.share[i]) }));
          const lab = sq.map((q, i) => { const wd = names[i].length * 6.6 + 2, right = q.x + 9 + wd <= 358; return { i, wd, right, x: right ? q.x + 9 : q.x - 9, y: q.y }; });
          const span = l => (l.right ? [l.x, l.x + l.wd] : [l.x - l.wd, l.x]), hit = (a, b) => a[0] < b[1] && b[0] < a[1];
          for (let it = 0; it < 120; it++) {
            let moved = false;
            lab.forEach((a, ai) => {
              lab.forEach((b, bi) => {
                if (bi <= ai || !hit(span(a), span(b))) return;
                const gap = 14 - Math.abs(a.y - b.y); if (gap <= 0) return;
                const up = a.y < b.y || (a.y === b.y && ai < bi) ? -1 : 1; a.y += up * gap / 2; b.y -= up * gap / 2; moved = true;
              });
              sq.forEach((q, qi) => {
                if (qi === a.i || !hit(span(a), [q.x - 6, q.x + 6])) return;
                const gap = 13 - Math.abs(a.y - q.y); if (gap <= 0) return;
                a.y += (a.y < q.y ? -1 : 1) * gap; moved = true;
              });
              a.y = Math.min(yB - 7, Math.max(yT + 7, a.y));
            });
            if (!moved) break;
          }
          lab.forEach(l => { const q = sq[l.i]; if (Math.abs(l.y - q.y) > 4) s += '<line class="tick" x1="' + (q.x + (l.right ? 5 : -5)).toFixed(1) + '" y1="' + q.y.toFixed(1) + '" x2="' + (l.x + (l.right ? -2 : 2)).toFixed(1) + '" y2="' + l.y.toFixed(1) + '"/>'; });
          sq.forEach(q => { s += '<rect class="eco-unit" x="' + (q.x - 5).toFixed(1) + '" y="' + (q.y - 5).toFixed(1) + '" width="10" height="10" rx="2"/>'; });
          lab.forEach(l => { s += '<text class="knock" x="' + l.x.toFixed(1) + '" y="' + l.y.toFixed(1) + '" dy=".35em"' + (l.right ? '' : ' text-anchor="end"') + '>' + esc(names[l.i]) + '</text>'; });
          // the key: the province's share, the limits, a district
          s += '<line class="ref-heading" x1="0" y1="324" x2="22" y2="324"/><text x="28" y="324" dy=".35em">' + esc(K.fill(w.key_mid, { share: pct1(v.pool) })) + '</text>'
            + '<line class="fn-lim" x1="170" y1="324" x2="192" y2="324"/><text x="198" y="324" dy=".35em">' + esc(w.key_lim) + '</text>'
            + '<rect class="eco-unit" x="276" y="319" width="10" height="10" rx="2"/><text x="292" y="324" dy=".35em">' + esc(w.key_unit) + '</text>';
          const out = sg => names.filter((_, i) => v.side[i] === sg).join(sep) || w.none;
          return { box: '0 0 360 336', svg: s, label: K.fill(w.funnel_label, { k, share: pct1(v.pool), above: out(1) }) };
        }
        seg(at('v'), [{ value: 'map', label: w.map }, { value: 'funnel', label: w.funnel }], view, x => { view = x; render(); }, w.view);
        at('next').addEventListener('click', () => { k++; render(); });
        function render() {
          const v = survey(k), f = view === 'map' ? drawMap(v) : drawFunnel(v), svg = at('svg');
          svg.setAttribute('viewBox', f.box); svg.innerHTML = f.svg; svg.setAttribute('aria-label', f.label);
          const hi = Math.max(...v.share), top = v.share.indexOf(hi), tie = v.share.filter(s => s === hi).length > 1;
          const out = sg => esc(names.filter((_, i) => v.side[i] === sg).join(sep) || w.none);
          readout(at('read'), [{ value: pct1(hi), label: esc(K.fill(tie ? w.highest_tied : w.highest, { name: names[top], n: N[top].toLocaleString('en-US') })), hl: true },
            { value: out(1), label: esc(w.above) }]);
          at('note').textContent = K.fill(w.survey, { k }) + ' ' + K.fill(w.note, { west: Math.round(WEST * 100) + '%', rest: Math.round(REST * 100) + '%' });
        }
        render();
      });
    }
  }
  if (!customElements.get('hotspot-check')) customElements.define('hotspot-check', HotspotCheck);
})();
