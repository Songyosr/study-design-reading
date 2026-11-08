/* <headline-check>: a headline and the questions to ask before believing it; each question, opened,
   shows which component (or time) it probes. Was widget 1 in app.js (chapter 1, section 3); moved
   here on 6 October 2026. From the page's widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w1-asks, w1-q-0, …)
     headline, source           the headline and its source line
     components                 the names of pop, meas, qty and time (their colours are fixed here)
     questions                  each: component (pop, meas, qty or time), q, why
     words                      chips_label (the chips' group, for screen readers); not_yet (after an
                                unprobed chip's name); opened, opened_value and probed, probed_value
                                ("{n} of {total}") (the readout)
   Reuse: copy the block and change any of it: every word and number it shows is there, the
   questions included (each belongs to pop, meas, qty or time). */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, readout } = K;
  const CLS = { pop: 'terra-t-a', meas: 'terra-t-b', qty: 'terra-t-c', time: 'terra-t-anchor' };
  class HeadlineCheck extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = d.id, at = s => $('#' + id + '-' + s);
      K.frame(this, d, '<div class="hl"><div class="hl-num">' + esc(d.headline) + '</div><div class="hl-src">' + esc(d.source) + '</div></div>'
        + '<div class="asks" id="' + esc(id) + '-asks"></div>'
        + '<div class="chips" id="' + esc(id) + '-chips" role="group" aria-label="' + esc(w.chips_label) + '"></div>'
        + '<div class="terra-readout" id="' + esc(id) + '-read"></div>');
      K.run('headline-check', () => {
        const COMP = {}; Object.keys(CLS).forEach(k => { COMP[k] = { cls: CLS[k], name: d.components[k] }; });
        const Q = K.list(d.questions).map(x => ({ c: x.component, q: x.q, why: x.why }));
        const open = new Set([0]);
        const host = at('asks');
        Q.forEach((it, i) => {
          const card = document.createElement('div'); card.className = 'ask ' + COMP[it.c].cls; card.id = id + '-card-' + i;
          card.innerHTML = '<button type="button" class="ask-q" id="' + id + '-q-' + i + '" aria-expanded="false" aria-controls="' + id + '-a-' + i + '">' + esc(it.q) + '</button>' +
            '<div class="ask-a" id="' + id + '-a-' + i + '" hidden><span class="terra-chip ' + COMP[it.c].cls + '">' + COMP[it.c].name + '</span><span>' + esc(it.why) + '</span></div>';
          host.appendChild(card);
          at('q-' + i).addEventListener('click', () => { if (open.has(i)) open.delete(i); else open.add(i); paint(); });
        });
        function paint() {
          Q.forEach((it, i) => {
            const on = open.has(i);
            at('card-' + i).classList.toggle('is-open', on);
            at('q-' + i).setAttribute('aria-expanded', String(on));
            at('a-' + i).hidden = !on;
          });
          const got = {}; open.forEach(i => { got[Q[i].c] = true; });
          at('chips').innerHTML = Object.keys(COMP).map(k => '<span class="terra-chip ' + COMP[k].cls + (got[k] ? '' : ' is-off') + '">' + COMP[k].name + (got[k] ? '' : esc(w.not_yet)) + '</span>').join('');
          readout(at('read'), [
            { value: esc(K.fill(w.opened_value, { n: open.size, total: Q.length })), label: esc(w.opened) },
            { value: esc(K.fill(w.probed_value, { n: Object.keys(got).length, total: 4 })), label: esc(w.probed), hl: Object.keys(got).length === 4 }]);
        }
        paint();
      });
    }
  }
  if (!customElements.get('headline-check')) customElements.define('headline-check', HeadlineCheck);
})();
