/* <card-quiz>: one invented card at a time; the reader picks a choice and reads the feedback. Was two
   widgets in app.js with the same code: 9, "Name the failure" (chapter 2, section 9), and 17, "Within
   the evidence?" (chapter 4, section 18); moved here on 6 October 2026. From the page's widget block
   (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w9-text, w9-choices, …)
     group                      the name of the group of choice buttons, for screen readers
     prompt                     the feedback before a choice
     also                       the opening of the feedback for a defensible other choice; {suggested}
                                is the suggested choice, in lower case
     choices                    key: label, in order
     cards                      each: text, answer (a choice's key), also (other defensible keys), why
     words                      previous, next (the buttons); card ("Card {n} of {total}"); fits and
                                look_again (the feedback's opening; {suggested}); answered, answered_value
                                ("{done} of {total}") and matching (the readout)
   Reuse: copy the block and change any of it: every word and number it shows is there, choices
   and cards included. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, $$, esc, readout } = K;
  class CardQuiz extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<span class="flaw-n" id="' + id + '-n"></span>'
        + '<p class="flaw" id="' + id + '-text"></p>'
        + '<div class="choices" id="' + id + '-choices" role="group" aria-label="' + esc(d.group) + '"></div>'
        + '<p class="fb" id="' + id + '-fb" aria-live="polite"></p>'
        + '<div class="terra-w-controls"><button class="btn" id="' + id + '-prev" type="button">' + esc(w.previous) + '</button><button class="btn is-primary" id="' + id + '-next" type="button">' + esc(w.next) + '</button></div>'
        + '<div class="terra-readout" id="' + id + '-read"></div>');
      K.run('card-quiz', () => {
        const OPT = {}; Object.keys(d.choices).forEach(k => { OPT[k] = { label: d.choices[k] }; });
        const CARDS = K.list(d.cards).map(c => ({ t: c.text, a: c.answer, alt: K.list(c.also), why: c.why }));
        let i = 0; const ans = CARDS.map(() => null);
        const host = at('choices');
        Object.keys(OPT).forEach(k => {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.dataset.v = k; b.textContent = OPT[k].label; b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', () => { ans[i] = k; render(); }); host.appendChild(b);
        });
        at('prev').addEventListener('click', () => { if (i > 0) { i--; render(); } });
        at('next').addEventListener('click', () => { if (i < CARDS.length - 1) { i++; render(); } });
        function render() {
          const c = CARDS[i], a = ans[i];
          at('n').textContent = K.fill(w.card, { n: i + 1, total: CARDS.length }); at('text').textContent = c.t;
          $$('button', host).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === a)));
          let fb = d.prompt;
          if (a) {
            if (a === c.a) fb = w.fits + c.why;
            else if (c.alt.indexOf(a) >= 0) fb = d.also.replace('{suggested}', OPT[c.a].label.toLowerCase()) + c.why;
            else fb = K.fill(w.look_again, { suggested: OPT[c.a].label.toLowerCase() }) + c.why;
          }
          at('fb').textContent = fb;
          at('prev').disabled = i === 0; at('next').disabled = i === CARDS.length - 1;
          const done = ans.filter(Boolean).length, match = ans.filter((x, j) => x && (x === CARDS[j].a || CARDS[j].alt.indexOf(x) >= 0)).length;
          readout(at('read'), [{ value: esc(K.fill(w.answered_value, { done, total: CARDS.length })), label: esc(w.answered) }, { value: String(match), label: esc(w.matching), hl: done === CARDS.length }]);
        }
        render();
      });
    }
  }
  if (!customElements.get('card-quiz')) customElements.define('card-quiz', CardQuiz);
})();
