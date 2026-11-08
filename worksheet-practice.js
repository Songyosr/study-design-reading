/* <worksheet-practice>: practise Workshop 1's worksheet (v7, 7 November 2026) on invented studies, alone:
   tag each highlighted phrase (goal, time, population, measurement, estimation), then fill the sheet's
   five rows and check them: 1 goal; 2 time (E and O on a timeline around the fixed start, the arrow the
   way the study traced, the timing); 3 design ("This is a ___ because ___"); 4 take it apart (for each
   component, the phrases tagged with it are the fact, then the one of chapter 1's three questions that
   matters most, by chapter 1's meanings, shown in brackets); 5 your own (one gap, given: its main worry,
   whether they could have done better with what they had, the student's own sentence, unchecked, then a
   model "Because the study …, the answer …"). Rebuilt with Tonn on 7 November 2026 (it practised
   October's six rows, question, who, what, number, time and worry, by tagging alone); the same day,
   "exposure measured" was dropped (the time row and "When is each thing measured?" carry it) and row 5
   became one given gap (Tonn: "choice or limitation" alone can tell the wrong story). First written as
   widget 6 in app.js, moved here on 6 October 2026.
   From the page's widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w6-text, w6-goal, …)
     tags                       the phrase tags, in order: key (goal, time, pop, meas, est), label,
                                short (the mark after a tagged phrase), hint
     questions                  pop, meas, est: chapter 1's three questions for each component
     designs                    the design names offered in row 3; reasons, the "because" choices
     better                     yes, no, depends (row 5: could they have done better with what they had?);
                                worries: sel, inf, diff, chance, conf (row 5's main worry)
     studies                    each: name; text, a list of plain stretches (say) and phrases (phrase,
                                tag, also: other defensible tags, why); missing (what it does not tell);
                                sheet: goal, directionality, design (accept: the
                                answers taken, first = suggested; why), because, pop, meas, est (accept:
                                numbers into reasons or questions), E and O (accept: none, before, at
                                or after; at: the suggested step, -5 to 5, 0 = study start; why), order
                                (E<O when the exposure must come first), timing (answer, why); gap: text,
                                worry and better (accept lists of keys, first = suggested), why, sentence
     words                      every other phrase the widget shows (row headings, questions, empty
                                choices, the options, buttons, feedback, the check list with suggested
                                ({s}, shown when a choice is not the suggested one), the readout)
   Reuse: copy the block and change any of it; a study's answers use the words of the sheet's choices. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, $$, esc, readout } = K;
  const CLS = { goal: 'terra-t-anchor', time: 'terra-t-anchor', pop: 'terra-t-a', meas: 'terra-t-b', est: 'terra-t-c' };
  const COMP = ['pop', 'meas', 'est'];
  const FIELDS = ['goal', 'dir', 'tim', 'des', 'why', 'q-pop', 'q-meas', 'q-est', 'worry', 'better'];
  const num = x => (x == null ? null : Number(x));
  const opts = (first, pairs) => '<option value="">' + esc(first) + '</option>' + pairs.map(([v, s]) => '<option value="' + esc(v) + '">' + esc(s) + '</option>').join('');
  const same = list => list.map(s => [s, s]);
  class WorksheetPractice extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      const TAGS = K.list(d.tags), TAG = {}, Q = d.questions || {}, BETTER = d.better || {}, WORRY = d.worries || {};
      TAGS.forEach(t => { TAG[t.key] = t; });
      const numbered = list => K.list(list).map((s, i) => [String(i + 1), s]);
      const keyed = o => Object.keys(o).map(k => [k, o[k]]);
      const CHOICES = {
        goal: same([w.describe, w.predict, w.explain_cause, w.unclear]), dir: same([w.forward, w.backward, w.non_directional]),
        tim: same([w.historical, w.concurrent, w.mixed]), des: same(K.list(d.designs)), why: numbered(d.reasons),
        'q-pop': numbered(Q.pop), 'q-meas': numbered(Q.meas), 'q-est': numbered(Q.est), worry: keyed(WORRY), better: keyed(BETTER) };
      const q = (label, k, first) => '<label class="sheet-q"><b>' + esc(label) + '</b><select id="' + id + '-' + k + '">' + opts(first, CHOICES[k]) + '</select></label>';
      const row = (label, body) => '<div class="ws-row"><span class="ws-h">' + esc(label) + '</span>' + body + '</div>';
      const comp = k => '<div class="ws-comp ' + CLS[k] + '"><b>' + esc(TAG[k].label) + '</b><p class="ws-fact" id="' + id + '-fact-' + k + '"></p>'
        + q(w.matters_q, 'q-' + k, w.pick_one) + '</div>';
      K.frame(this, d, '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-seg-l">' + esc(w.invented_study) + '</span><div class="terra-seg" id="' + id + '-seg"></div></div>'
        + '<p class="vign" id="' + id + '-text"></p>'
        + '<div class="tagbar" id="' + id + '-tags" role="group" aria-label="' + esc(w.tags_group) + '"></div>'
        + '<p class="fb" id="' + id + '-fb" aria-live="polite"></p>'
        + '<div class="sheet-box" id="' + id + '-sheet">'
        + '<span class="sk">' + esc(w.sheet_title) + '</span>'
        + row(w.r_goal, q(w.goal_q, 'goal', w.choose))
        + row(w.r_time, '<span class="hint">' + esc(w.timeline_hint) + '</span>'
          + '<div class="tl-scale" aria-hidden="true"><span></span><span>' + esc(w.scale_before) + '</span><span>▼</span><span>' + esc(w.scale_after) + '</span><span></span></div>'
          + '<div class="tl-row" id="' + id + '-tl-E" role="group" aria-label="' + esc(w.exposure_row) + '"></div>'
          + '<div class="tl-row tl-arrow-row" id="' + id + '-tl-arrow" aria-hidden="true"></div>'
          + '<div class="tl-row" id="' + id + '-tl-O" role="group" aria-label="' + esc(w.outcome_row) + '"></div>'
          + q(w.dir_q, 'dir', w.which_way) + q(w.tim_q, 'tim', w.before_after))
        + row(w.r_design, q(w.design_q, 'des', w.choose) + q(w.because_q, 'why', w.choose))
        + row(w.r_apart, '<span class="hint">' + esc(w.apart_hint) + '</span><div class="ws-comps">' + COMP.map(comp).join('') + '</div>')
        + row(w.r_own, '<span class="hint">' + esc(w.own_hint) + '</span><p class="ws-gap" id="' + id + '-gap"></p>' + q(w.worry_q, 'worry', w.choose) + q(w.better_q, 'better', w.choose)
          + '<label class="sheet-q ws-own"><b>' + esc(w.sentence_q) + '</b><textarea id="' + id + '-own" rows="3" placeholder="' + esc(w.sentence_ph) + '"></textarea></label>'
          + '<p class="ws-model" id="' + id + '-model" hidden></p>')
        + '<div class="terra-w-controls"><button class="btn is-primary" id="' + id + '-check" type="button">' + esc(w.check) + '</button><button class="btn" id="' + id + '-reveal" type="button">' + esc(w.reveal) + '</button><button class="btn" id="' + id + '-clear" type="button">' + esc(w.clear) + '</button></div>'
        + '<ul class="chk-list" id="' + id + '-check-out" aria-live="polite"></ul>'
        + '</div>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<div class="missing" id="' + id + '-missing" hidden></div>');
      K.run('worksheet-practice', () => {
        const acc = s => ({ ok: K.list(s && s.accept).map(String), why: s ? s.why : '' });
        const V = K.list(d.studies).map(v => {
          const s = v.sheet;
          return {
            name: v.name,
            parts: K.list(v.text).map(x => (x.phrase != null ? { p: x.phrase, tag: x.tag, alt: K.list(x.also), why: x.why } : String(x.say))),
            missing: K.list(v.missing),
            gap: v.gap ? { text: v.gap.text, worry: K.list(v.gap.worry), better: K.list(v.gap.better), why: v.gap.why, sentence: v.gap.sentence } : null,
            sheet: {
              goal: acc(s.goal), dir: acc(s.directionality), des: acc(s.design), why: acc(s.because),
              'q-pop': acc(s.pop), 'q-meas': acc(s.meas), 'q-est': acc(s.est),
              E: acc(s.E), O: acc(s.O), order: s.order || null, pos: { E: num(s.E.at), O: num(s.O.at) },
              tim: { ok: [s.timing.answer], why: s.timing.why } },
          };
        });
        const blank = v => { const a = { tags: v.parts.filter(x => typeof x !== 'string').map(() => null), E: null, O: null, own: '' }; FIELDS.forEach(k => { a[k] = ''; }); return a; };
        const A = V.map(blank);
        let vi = 0, sel = null;
        K.seg(at('seg'), V.map((v, i) => ({ value: String(i), label: v.name })), '0', v => { vi = +v; sel = null; at('check-out').innerHTML = ''; at('model').hidden = true; load(); render(); }, w.invented_study);
        const tagHost = at('tags');
        TAGS.forEach(t => {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'tagbtn ' + CLS[t.key]; b.id = d.id + '-tag-' + t.key; b.textContent = t.label; b.disabled = true;
          b.addEventListener('click', () => { if (sel == null) return; A[vi].tags[sel] = t.key; say(); render(true); }); tagHost.appendChild(b);
        });
        const phrases = () => V[vi].parts.filter(x => typeof x !== 'string');
        function say() {
          const ph = phrases()[sel], t = A[vi].tags[sel];
          if (!t) { at('fb').textContent = w.choose_row; return; }
          if (t === ph.tag) at('fb').textContent = w.fits + ph.why;
          else if (ph.alt.indexOf(t) >= 0) at('fb').textContent = K.fill(w.also, { row: TAG[ph.tag].label }) + ph.why;
          else at('fb').textContent = w.another + TAG[ph.tag].hint;
        }
        /* timeline pickers: positions -5..5, 0 = the study start */
        function buildTL(which) {
          const host = at('tl-' + which); host.innerHTML = '';
          const lab = document.createElement('span'); lab.className = 'who'; lab.textContent = which; host.appendChild(lab);
          for (let p = -5; p <= 5; p++) {
            const b = document.createElement('button'); b.type = 'button'; b.className = 'tl-cell' + (p < 0 ? ' past' : '') + (p === 0 ? ' zero' : ''); b.dataset.p = String(p);
            const who = which === 'E' ? w.exposure : w.outcome;
            b.setAttribute('aria-label', p < 0 ? K.fill(w.cell_before, { who, n: -p }) : (p === 0 ? K.fill(w.cell_at, { who }) : K.fill(w.cell_after, { who, n: p })));
            b.textContent = p === 0 ? '▼' : '';
            b.addEventListener('click', () => { A[vi][which] = A[vi][which] === p ? null : p; render(true); }); host.appendChild(b);
          }
          const end = document.createElement('span'); end.className = 'hint'; end.textContent = which === 'E' ? w.exposure_end : w.outcome_end; host.appendChild(end);
        }
        buildTL('E'); buildTL('O');
        FIELDS.forEach(k => { at(k).addEventListener('change', e => { A[vi][k] = e.target.value; render(true); }); });
        at('own').addEventListener('input', e => { A[vi].own = e.target.value; });
        function load() {
          at('gap').textContent = V[vi].gap ? V[vi].gap.text : '';
          FIELDS.forEach(k => { at(k).value = A[vi][k]; });
          at('own').value = A[vi].own;
        }
        const label = (k, v) => { const hit = CHOICES[k].find(p => p[0] === v); return hit ? hit[1] : v; };
        const cat = p => (p == null ? 'none' : (p < 0 ? 'before' : (p === 0 ? 'at' : 'after')));
        function check() {
          const a = A[vi], v = V[vi], sh = v.sheet, out = [];
          const stop = t => (/[.?!…]$/.test(t) ? t : t + '.');
          const line = (good, name, shown, why) => out.push('<li><span class="' + (good ? 'ok' : 'no') + '">' + (good ? '✓' : '✗') + '</span> <b>' + esc(name) + ':</b> ' + esc(stop(shown || w.not_chosen)) + (why ? ' ' + esc(why) : '') + '</li>');
          // a choice other than the suggested one (or none) also names the suggested answer
          const sug = (k, v, first) => (first && v !== first ? K.fill(w.suggested, { s: label(k, first) }) + ' ' : '');
          const item = (name, k) => line(sh[k].ok.indexOf(a[k]) >= 0, name, a[k] ? label(k, a[k]) : '', sug(k, a[k], sh[k].ok[0]) + sh[k].why);
          const head = s => out.push('<li class="chk-h">' + esc(s) + '</li>');
          head(w.r_goal); item(w.check_goal, 'goal');
          head(w.r_time);
          const wordOf = c => ({ none: w.not_placed, before: w.before_start, at: w.at_start, after: w.after_start })[c];
          ['E', 'O'].forEach(eo => { const c = cat(a[eo]); line(sh[eo].ok.indexOf(c) >= 0, eo === 'E' ? w.check_e : w.check_o, wordOf(c), sh[eo].why); });
          if (sh.order === 'E<O' && a.E != null && a.O != null) { const good = a.E < a.O; out.push('<li><span class="' + (good ? 'ok' : 'no') + '">' + (good ? '✓' : '✗') + '</span> <b>' + esc(w.check_order) + ':</b> ' + esc(good ? w.order_ok : w.order_no) + '</li>'); }
          item(w.check_dir, 'dir'); item(w.check_timing, 'tim');
          head(w.r_design); item(w.check_design, 'des'); item(w.check_because, 'why');
          head(w.r_apart); item(w.check_pop, 'q-pop'); item(w.check_meas, 'q-meas'); item(w.check_est, 'q-est');
          const g = v.gap;
          if (g) {
            head(w.r_own);
            line(g.worry.indexOf(a.worry) >= 0, w.check_worry, a.worry ? label('worry', a.worry) : '', sug('worry', a.worry, g.worry[0]).trim());
            line(g.better.indexOf(a.better) >= 0, w.check_better, a.better ? label('better', a.better) : '', sug('better', a.better, g.better[0]) + g.why);
            at('model').innerHTML = '<b>' + esc(w.model_title) + '</b> ' + esc(g.sentence); at('model').hidden = false;
          }
          at('check-out').innerHTML = out.join('');
        }
        at('check').addEventListener('click', () => { check(); render(true); });
        at('reveal').addEventListener('click', () => {
          const v = V[vi], sh = v.sheet, a = A[vi];
          a.tags = phrases().map(p => p.tag);
          ['goal', 'dir', 'tim', 'des', 'why', 'q-pop', 'q-meas', 'q-est'].forEach(k => { a[k] = sh[k].ok[0] || ''; });
          a.E = sh.pos.E; a.O = sh.pos.O;
          if (v.gap) { a.worry = v.gap.worry[0] || ''; a.better = v.gap.better[0] || ''; }
          sel = null; load(); at('fb').textContent = w.revealed; check(); render(true);
        });
        at('clear').addEventListener('click', () => { A[vi] = blank(V[vi]); sel = null; load(); at('check-out').innerHTML = ''; at('model').hidden = true; render(); });
        function render(keepFb) {
          const host = at('text');
          const hadFocus = document.activeElement && document.activeElement.classList && document.activeElement.classList.contains('ph');
          host.innerHTML = ''; let pi = 0;
          V[vi].parts.forEach(part => {
            if (typeof part === 'string') { host.appendChild(document.createTextNode(part)); return; }
            const i = pi++, b = document.createElement('span'); b.className = 'ph'; b.id = d.id + '-ph-' + i; b.setAttribute('role', 'button'); b.tabIndex = 0; b.setAttribute('aria-pressed', String(sel === i));
            const t = A[vi].tags[i]; if (t) b.classList.add('is-' + CLS[t].replace('terra-', ''));
            b.appendChild(document.createTextNode(part.p));
            if (t) { const sp = document.createElement('sup'); sp.textContent = TAG[t].short; b.appendChild(sp); }
            const pick = () => { sel = i; if (A[vi].tags[i]) say(); else at('fb').textContent = w.choose_row; render(true); };
            b.addEventListener('click', pick);
            b.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } });
            host.appendChild(b);
          });
          if (hadFocus && sel != null) { const f = at('ph-' + sel); if (f) f.focus(); }
          TAGS.forEach(t => { at('tag-' + t.key).disabled = sel == null; });
          if (!keepFb && sel == null) at('fb').textContent = w.begin;
          // row 4's facts: the phrases tagged with each component
          const ps = phrases();
          COMP.forEach(k => {
            const got = ps.filter((p, i) => A[vi].tags[i] === k).map(p => '“' + p.p + '”'), f = at('fact-' + k);
            f.textContent = got.length ? got.join(' · ') : w.fact_none; f.classList.toggle('is-empty', !got.length);
          });
          const dv = A[vi].dir || '';
          ['E', 'O'].forEach(eo => { $$('button', at('tl-' + eo)).forEach(b => { const on = A[vi][eo] != null && +b.dataset.p === A[vi][eo]; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? eo : (b.dataset.p === '0' ? '▼' : ''); }); });
          const ah = at('tl-arrow'); ah.innerHTML = '';
          const src = dv === w.forward ? 'E' : (dv === w.backward ? 'O' : null);
          if (src && A[vi].E != null && A[vi].O != null && A[vi].E !== A[vi].O) {
            const tgt = src === 'E' ? 'O' : 'E', p1 = A[vi][src] + 5, p2 = A[vi][tgt] + 5, lo = Math.min(p1, p2), hi = Math.max(p1, p2), n = hi - lo + 1;
            const dd = document.createElement('div'); dd.className = 'tl-arr ' + (p2 > p1 ? 'r' : 'l'); dd.style.gridColumn = (lo + 2) + ' / ' + (hi + 3); dd.style.setProperty('--a0', (50 / n).toFixed(2) + '%');
            const hd = document.createElement('span'); hd.className = 'hd'; dd.appendChild(hd); ah.appendChild(dd);
          }
          const done = A[vi].tags.filter(Boolean).length;
          const filled = FIELDS.filter(k => A[vi][k] !== '').length + (A[vi].E != null ? 1 : 0) + (A[vi].O != null ? 1 : 0);
          readout(at('read'), [{ value: esc(K.fill(w.of, { done, total: ps.length })), label: esc(w.tagged) }, { value: esc(K.fill(w.of, { done: filled, total: FIELDS.length + 2 })), label: esc(w.choices_made) }]);
          const miss = at('missing');
          if (done === ps.length) { miss.hidden = false; miss.innerHTML = '<b>' + esc(w.missing_title) + '</b><ul>' + V[vi].missing.map(m => '<li>' + esc(m) + '</li>').join('') + '</ul>'; }
          else miss.hidden = true;
        }
        load(); render();
      });
    }
  }
  if (!customElements.get('worksheet-practice')) customElements.define('worksheet-practice', WorksheetPractice);
})();
