/* <district-sample>: Hogwarts's 400 simulated adults, sampled from a register, the hospital wing or a
   health fair, with or without refusals; the estimate against the true share, one draw or forty. Was
   widget 2 in app.js (chapter 1, section 4); moved here on 6 October 2026. The adults are the kit's
   simulated district. From the page's widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w2-grid, w2-plot, …)
     sources                    the names of random, clinic and fair (their tilts are fixed here)
     agree                      the names of all, lessD and lessN (their chances are fixed here)
     caption, note              the figure's caption and the note under the readout
     words                      source_label, agree_label, tilt_label, size_label, guess_label (the
                                controls' labels); source_group, agree_group, guess_group (the button
                                groups, for screen readers); guess_up, guess_flat, guess_down (the
                                guesses); skip, draw, batch ("Run {n} draws") (the buttons); grid_label
                                ({n} adults), plot_label, plot_shown ({est}, {truth}) and plot_hidden
                                ({truth}) (the figures, for screen readers); lean_none, red_tint,
                                lean_up, blue_tint, lean_down (the note under the grid); axis,
                                true_mark ({p}), this_sample, guess_first, batch_mark ({n}) (the plot);
                                gap_value ("{gap} pp"), true_share ({x} of {n}), in_sample, gap,
                                covers, yes, no, invited_agreed, batch_label ({n}, {cut}), guess_wait
                                (the readout); fb_hidden, fb_skipped ({n}), fb_match, fb_miss
                                ({expected}: expect_up, expect_flat or expect_down) and fb_landed
                                ({gap}) (the feedback on the guess)
   Reuse: copy the block to reword it; it samples the reading's simulated district
   (widgets/data.js), and how each source tilts is in this file. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, seg, readout, pct1, mulberry32, qnorm } = K;
  const { N, gluc, diab, perm, TRUE_X, TRUE_P } = K.district;
  class DistrictSample extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-frame-l">' + esc(w.source_label) + '</span><div class="terra-seg" id="' + id + '-frame"></div></div>'
        + '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-agree-l">' + esc(w.agree_label) + '</span><div class="terra-seg" id="' + id + '-agree"></div></div>'
        + K.slider(d.id, 'k', { label: w.tilt_label, min: '0.25', max: '6', step: '0.25', value: '1' })
        + K.slider(d.id, 'n', { label: w.size_label, min: '20', max: '160', step: '10', value: '80' })
        + '<div id="' + id + '-pred" hidden>'
        + '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-pred-l">' + esc(w.guess_label) + '</span><div class="terra-seg" id="' + id + '-guess"></div><button class="btn" id="' + id + '-skip" type="button">' + esc(w.skip) + '</button></div>'
        + '<p class="pred-fb" id="' + id + '-pred-fb" aria-live="polite"></p>'
        + '</div>'
        + '<div class="terra-w-controls"><button class="btn is-primary" id="' + id + '-draw" type="button">' + esc(w.draw) + '</button><button class="btn" id="' + id + '-batch" type="button">' + esc(K.fill(w.batch, { n: 40 })) + '</button></div>'
        + '<div class="w2-figs">'
        + '<figure><svg class="fig-svg" id="' + id + '-grid" role="img" aria-label="' + esc(K.fill(w.grid_label, { n: N })) + '"></svg><p class="lean-note" id="' + id + '-lean" aria-live="polite"></p><figcaption>' + esc(d.caption) + '</figcaption></figure>'
        + '<figure><svg class="fig-svg" id="' + id + '-plot" role="img" aria-label="' + esc(w.plot_label) + '"></svg></figure>'
        + '</div>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<p class="terra-w-note">' + esc(d.note) + '</p>');
      K.run('district-sample', () => {
        const FR = { random: { label: d.sources.random, k: 1, fixed: true }, clinic: { label: d.sources.clinic, k: 3 }, fair: { label: d.sources.fair, k: 0.5 } };
        /* shown: the draw is hidden for a tilted frame until the reader guesses or chooses to skip */
        const W = { frame: 'random', n: 80, k: 1, seed: 4, guess: null, batch: null, shown: true, agree: 'all' };
        /* agreement after invitation; 'all' keeps the draws identical to the slides */
        const AG = { all: { label: d.agree.all, pD: 1, pN: 1 }, lessD: { label: d.agree.lessD, pD: 0.55, pN: 0.85 }, lessN: { label: d.agree.lessN, pD: 0.9, pN: 0.6 } };
        /* selection follows glucose: weight exp(beta*z), where z is the person's glucose on the normal scale. beta is set so that,
           on average, people with diabetes are k times as likely to be selected as people without; k = 1 gives equal chances */
        const zOf = new Array(N); for (let k = 0; k < N; k++) zOf[perm[k]] = qnorm((k + 0.5) / N);
        const ratioAt = b => { let sd = 0, nd = 0, sn = 0, nn = 0; for (let i = 0; i < N; i++) { const w = Math.exp(b * zOf[i]); if (diab[i]) { sd += w; nd++; } else { sn += w; nn++; } } return (sd / nd) / (sn / nn); };
        const betaCache = {};
        const betaFor = k => { if (k === 1) return 0; if (betaCache[k] != null) return betaCache[k]; let lo = -5, hi = 5; for (let t = 0; t < 60; t++) { const m = (lo + hi) / 2; if (ratioAt(m) < k) lo = m; else hi = m; } return (betaCache[k] = (lo + hi) / 2); };
        /* display: people lined up by glucose, highest on the left, so people with diabetes fill the left columns */
        const slotOf = new Array(N); { const ord = []; for (let i = 0; i < N; i++) ord.push(i); ord.sort((a, b) => gluc[b] - gluc[a] || a - b); ord.forEach((i, sl) => { slotOf[i] = sl; }); }
        function agreeOf(ids, seed) { if (W.agree === 'all') return ids.slice(); const a = AG[W.agree], r = mulberry32(seed * 104729 + 17); return ids.filter(i => r() < (diab[i] ? a.pD : a.pN)); }
        function sample(n, k, seed) {
          const b = betaFor(k), r = mulberry32(seed * 7919 + 13), keys = [];
          for (let i = 0; i < N; i++) { const w = Math.exp(b * zOf[i]); const u = Math.max(r(), 1e-12); keys.push([Math.pow(u, 1 / w), i]); }
          keys.sort((a, c) => c[0] - a[0]); return keys.slice(0, n).map(x => x[1]);
        }
        function est(ids) { let x = 0; ids.forEach(i => { if (diab[i]) x++; }); return { x: x, n: ids.length, p: x / ids.length }; }
        function wilson(x, n) { const ne = n / (1 - n / N), p = x / n, z = 1.96, dd = 1 + z * z / ne, c = (p + z * z / (2 * ne)) / dd, h = z * Math.sqrt(p * (1 - p) / ne + z * z / (4 * ne * ne)) / dd; return [Math.max(0, c - h), Math.min(1, c + h)]; }
        const tone = g => g > 0.5 ? 'up' : (g < -0.5 ? 'down' : 'flat');
        const kOut = at('k-o'), nOut = at('n-o');
        seg(at('frame'), Object.keys(FR).map(k => ({ value: k, label: FR[k].label })), W.frame, v => {
          W.frame = v; W.k = FR[v].k; W.guess = null; W.batch = null; W.shown = !!FR[v].fixed; at('k').value = W.k; at('k').disabled = !!FR[v].fixed;
          at('pred').hidden = !!FR[v].fixed; guessSeg.set(''); render();
        }, w.source_group);
        seg(at('agree'), Object.keys(AG).map(k => ({ value: k, label: AG[k].label })), W.agree, v => { W.agree = v; W.batch = null; render(); }, w.agree_group);
        const guessSeg = seg(at('guess'), [{ value: 'up', label: w.guess_up }, { value: 'flat', label: w.guess_flat }, { value: 'down', label: w.guess_down }], '', v => { W.guess = v; W.shown = true; render(); }, w.guess_group);
        at('skip').addEventListener('click', () => { W.shown = true; render(); at('draw').focus(); });
        at('k').disabled = true;
        at('k').addEventListener('input', e => { W.k = +e.target.value; W.batch = null; render(); });
        at('n').addEventListener('input', e => { W.n = +e.target.value; W.batch = null; render(); });
        at('draw').addEventListener('click', () => { if (!W.shown) return; W.seed++; render(); });
        at('batch').addEventListener('click', () => { if (!W.shown) return; const arr = []; for (let s = 0; s < 40; s++) { const sd = W.seed * 1000 + s + 1; arr.push(est(agreeOf(sample(W.n, W.k, sd), sd)).p); } W.batch = arr; render(); });
        function render() {
          kOut.textContent = '×' + W.k.toFixed(2); nOut.textContent = String(W.n);
          at('draw').disabled = !W.shown; at('batch').disabled = !W.shown; at('skip').hidden = W.shown;
          const inv = sample(W.n, W.k, W.seed), ids = agreeOf(inv, W.seed), inS = {}, invS = {}; if (W.shown) { ids.forEach(i => { inS[i] = 1; }); inv.forEach(i => { invS[i] = 1; }); }
          const e = est(ids), ci = wilson(e.x, e.n), gap = (e.p - TRUE_P) * 100, t = tone(gap);
          /* grid, with a tint on the half the analysed sample leans toward (left = higher glucose) */
          /* tint follows the process (selection tilt and who agrees), not the draw: equal chances never tint */
          let g = ''; const ptilt = W.k * AG[W.agree].pD / AG[W.agree].pN, plt = Math.log(ptilt), op = W.shown ? Math.min(0.45, Math.abs(plt) * 0.32) : 0;
          if (op > 0.02) {
            const upd = plt > 0, cv = upd ? '--push-up' : '--push-down';
            g += '<defs><linearGradient id="w2-lg" x1="' + (upd ? 0 : 1) + '" x2="' + (upd ? 1 : 0) + '" y1="0" y2="0"><stop offset="0" style="stop-color:var(' + cv + ');stop-opacity:' + op.toFixed(2) + '"/><stop offset="0.9" style="stop-color:var(' + cv + ');stop-opacity:0"/></linearGradient></defs><rect x="4" y="4" width="368" height="368" rx="6" fill="url(#w2-lg)"/>';
          }
          for (let i = 0; i < N; i++) {
            const sl = slotOf[i], cx = 17 + Math.floor(sl / 20) * 18, cy = 17 + (sl % 20) * 18;
            g += '<circle cx="' + cx + '" cy="' + cy + '" r="6" class="' + (diab[i] ? (inS[i] ? 'd-case' : 'd-case-dim') : 'd-no') + '"/>';
            if (inS[i]) g += '<circle cx="' + cx + '" cy="' + cy + '" r="8.6" class="d-ring"/>';
            else if (invS[i]) g += '<circle cx="' + cx + '" cy="' + cy + '" r="8.6" class="d-ring-dec"/>';
          }
          const grid = at('grid'); grid.setAttribute('viewBox', '0 0 376 376'); grid.innerHTML = g;
          at('lean').innerHTML = !W.shown ? '' : (op <= 0.02 ? esc(w.lean_none) : (plt > 0 ? '<b class="t-up">▲ ' + esc(w.red_tint) + '</b>' + esc(w.lean_up) : '<b class="t-down">▼ ' + esc(w.blue_tint) + '</b>' + esc(w.lean_down)));
          /* plot: 0-60 percent on one scale */
          const X = v => 14 + Math.min(60, Math.max(0, v * 100)) * (252 / 60), yAx = 170;
          const ticks = []; for (let v = 0; v <= 60; v += 10) ticks.push({ x: X(v / 100), label: v });
          let p = K.axis(14, 266, yAx, ticks);
          p += '<text class="mono" x="140" y="' + (yAx + 33) + '" text-anchor="middle">' + esc(w.axis) + '</text>';
          p += '<line class="ref" x1="' + X(TRUE_P) + '" y1="30" x2="' + X(TRUE_P) + '" y2="' + yAx + '"/><text class="mono strong" x="' + X(TRUE_P) + '" y="22" text-anchor="middle">' + esc(K.fill(w.true_mark, { p: pct1(TRUE_P) })) + '</text>';
          if (W.shown) {
            const cls = t === 'up' ? 'push-up' : (t === 'down' ? 'push-down' : 'd-flat');
            const lx = Math.min(222, Math.max(44, X(e.p)));
            p += '<text class="strong knock" x="' + lx + '" y="50" text-anchor="middle">' + (t === 'up' ? '▲ ' : t === 'down' ? '▼ ' : '') + pct1(e.p) + '</text>';
            p += '<line x1="' + X(ci[0]) + '" y1="68" x2="' + X(ci[1]) + '" y2="68" stroke="var(--data-slate)" stroke-width="2" stroke-linecap="round"/>';
            p += '<circle cx="' + X(e.p) + '" cy="68" r="6" class="' + cls + '"/>';
            p += '<text class="mono knock" x="14" y="94">' + esc(w.this_sample) + '</text>';
          } else {
            p += '<text class="mono knock" x="140" y="80" text-anchor="middle">' + esc(w.guess_first) + '</text>';
          }
          if (W.shown && W.batch) {
            const bins = {}; let up = 0, dn = 0;
            W.batch.forEach(v => {
              const b = Math.round(v * 100); bins[b] = (bins[b] || 0) + 1; const j = bins[b] - 1; const tt = tone((v - TRUE_P) * 100); if (tt === 'up') up++; if (tt === 'down') dn++;
              p += '<circle cx="' + X(b / 100) + '" cy="' + (yAx - 5 - j * 7.4) + '" r="3.2" class="' + (tt === 'up' ? 'push-up' : tt === 'down' ? 'push-down' : 'd-flat') + '"/>';
            });
            p += '<text class="mono knock" x="14" y="112">' + esc(K.fill(w.batch_mark, { n: 40 })) + '</text>';
            W.batchCount = { up: up, dn: dn };
          }
          const plot = at('plot'); plot.setAttribute('viewBox', '0 0 280 206'); plot.innerHTML = p;
          plot.setAttribute('aria-label', W.shown ? K.fill(w.plot_shown, { est: pct1(e.p), truth: pct1(TRUE_P) }) : K.fill(w.plot_hidden, { truth: pct1(TRUE_P) }));
          /* readout */
          const gtxt = K.fill(w.gap_value, { gap: (gap > 0 ? '▲ +' : gap < 0 ? '▼ −' : '') + Math.abs(gap).toFixed(1) });
          let items = [{ value: pct1(TRUE_P), label: esc(K.fill(w.true_share, { x: TRUE_X, n: N })) }];
          if (W.shown) {
            items = items.concat([{ value: e.x + '/' + e.n + ' = ' + pct1(e.p), label: esc(w.in_sample) },
              { value: esc(gtxt), label: esc(w.gap), hl: true }, { value: esc((TRUE_P >= ci[0] && TRUE_P <= ci[1]) ? w.yes : w.no), label: esc(w.covers) }]);
            if (W.agree !== 'all') items.splice(1, 0, { value: inv.length + ' → ' + ids.length, label: esc(w.invited_agreed) });
            if (W.batch) items.push({ value: '▲ ' + W.batchCount.up + ' · ▼ ' + W.batchCount.dn, label: esc(K.fill(w.batch_label, { n: 40, cut: 0.5 })) });
          } else items.push({ value: '?', label: esc(w.guess_wait) });
          readout(at('read'), items);
          /* prediction feedback */
          const tilt = W.k * AG[W.agree].pD / AG[W.agree].pN, exp = tilt > 1.2 ? 'up' : (tilt < 0.85 ? 'down' : 'flat'), word = { up: w.expect_up, flat: w.expect_flat, down: w.expect_down };
          const fb = at('pred-fb');
          if (FR[W.frame].fixed) fb.textContent = '';
          else if (!W.shown) fb.textContent = w.fb_hidden;
          else if (!W.guess) fb.textContent = K.fill(w.fb_skipped, { n: 40 });
          else fb.textContent = (W.guess === exp ? w.fb_match : K.fill(w.fb_miss, { expected: word[exp] })) + K.fill(w.fb_landed, { gap: gtxt });
        }
        render();
      });
    }
  }
  if (!customElements.get('district-sample')) customElements.define('district-sample', DistrictSample);
})();
