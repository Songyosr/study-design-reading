/* The EPI-II reading's own data, shared by its widgets and the prose numbers in chapter 1: the
   simulated district of 400, the invented cohort of 20 and the invented staff of 20 (K.castle). sewn loads this file after the kit
   (design/widgets/kit.js) and before the widgets, on every page with a widget. Moved verbatim from
   kit.js on 6 October 2026. */
(function () {
  'use strict';
  const { $$, pct1, mulberry32, qnorm } = window.SewnKit;

  /* ---------- simulated district: 400 residents, glucose values fixed by seed ---------- */
  const N = 400, CUT = 126, M0 = 97, S0 = 0.22;
  const rngPop = mulberry32(20261109);
  const sortedG = []; for (let k = 0; k < N; k++) sortedG.push(Math.round(M0 * Math.exp(S0 * qnorm((k + 0.5) / N))));
  const perm = []; for (let i = 0; i < N; i++) perm.push(i);
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(rngPop() * (i + 1)); const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
  const gluc = new Array(N); for (let k = 0; k < N; k++) gluc[perm[k]] = sortedG[k];
  const diab = gluc.map(g => g >= CUT);
  const TRUE_X = diab.filter(Boolean).length, TRUE_P = TRUE_X / N;

  /* ---------- invented cohort: 20 people, 12 months ---------- */
  const COHORT = [
    { id: 1, pre: true, exit: 12 }, { id: 2, pre: true, exit: 6, why: 'moved' }, { id: 3, on: 3, exit: 12 }, { id: 4, on: 5, exit: 10, why: 'died' }, { id: 5, on: 9, exit: 12 },
    { id: 6, exit: 12 }, { id: 7, exit: 12 }, { id: 8, exit: 3, why: 'moved' }, { id: 9, exit: 12 }, { id: 10, exit: 12 }, { id: 11, exit: 12 }, { id: 12, exit: 8, why: 'moved' },
    { id: 13, exit: 12 }, { id: 14, exit: 12 }, { id: 15, exit: 6, why: 'died' }, { id: 16, exit: 12 }, { id: 17, exit: 12 }, { id: 18, exit: 12 }, { id: 19, exit: 12 }, { id: 20, exit: 12 }];
  const isCase = p => !!p.pre || p.on != null;
  const riskT = p => (p.on != null ? Math.min(p.on, p.exit) : p.exit);
  /* the same cohort with complete follow-up: nobody moves away or dies before 31 December */
  const COHORT_C = COHORT.map(p => ({ id: p.id, pre: p.pre, on: p.on, exit: 12 }));
  function stats(co) {
    const free = co.filter(p => !p.pre), at = co.filter(p => p.exit === 12);
    return { pre: co.filter(p => p.pre), free: free, inc: free.filter(p => p.on != null), at12: at, cases12: at.filter(isCase), ever: co.filter(isCase),
      movers: free.filter(p => p.why === 'moved' && p.on == null), py: free.reduce((s, p) => s + riskT(p) / 12, 0) };
  }
  const S_C = stats(COHORT_C), S_D = stats(COHORT);

  /* ---------- invented staff: 20 adults on the school's staff register, 2016 to 2026 (the life-lines figures) ----------
     Times in years after 1 January 2016. e: drinks sweet drinks daily; pre: diabetes already when hired;
     on: onset; exit and why: leaving before 2026 (died, moved); visits: clinic visits on record (what a
     historical cohort reads; a visit after onset finds the diabetes); hired: joining the staff, which is
     each person's time zero. Each design's choices are fixed here: the case-control study's new cases
     with a control drawn from the staff on each case's date, and its health-fair controls (six people
     from outside the staff, seen once at a fair in 2025, one of whom drinks daily; Tonn, 7 November 2026;
     they replaced the index-date cases and controls); the
     trial's start, its arms by coin and by choice, who declined, and the programme's effect (when a
     drinker in it stops, and whose diabetes it puts off; 7 November 2026).
     Was 40 adults with switches (1 November); 20 adults, 3 November 2026 (person 1's diabetes starts
     in 2017, so the drinker who dies in 2019 is a new case); hiring dates added 5 November 2026 (Tonn:
     the cohort lined up at time zero), chosen so that every chapter 3 number stays as it was: each
     control and each clinic visit falls after its person's hiring, and the rate ratio for the whole
     staff stays about 4. Called a castle until 5 November (Tonn: "dont use the word castle"). */
  const CP = (id, e, pre, on, exit, why, visits, hired) => ({ id, e: !!e, pre: !!pre, on, exit: exit == null ? 10 : exit, why: why || null, visits: visits || [], hired: hired || 0 });
  const CASTLE = {
    years: [2016, 2026],
    people: [
      CP(1, 1, 0, 1, 3.5, 'died', [2.4], 0), CP(2, 1, 0, 1.5, null, null, [3.1, 7.4], 0), CP(3, 1, 0, 4, null, null, [2.2, 8], 1),
      CP(4, 1, 0, 7, null, null, [5.5], 2), CP(5, 1, 0, null, null, null, [4.1], 3), CP(6, 1, 0, null, 5, 'moved', [2], 0.5),
      CP(7, 1, 0, null, null, null, [6.3], 1.5), CP(8, 1, 0, null, null, null, [], 4),
      CP(9, 0, 1, null, null, null, [1, 5.2], 0.5), CP(10, 0, 0, 6, null, null, [6.6], 2.5), CP(11, 0, 0, 8.5, null, null, [9.2], 5),
      CP(12, 0, 0, null, null, null, [3.3], 3), CP(13, 0, 0, null, null, null, [], 0), CP(14, 0, 0, null, null, null, [7.7], 4), CP(15, 0, 0, null, null, null, [2.6], 0),
      CP(16, 0, 0, null, null, null, [5], 4.5), CP(17, 0, 0, null, null, null, [], 3), CP(18, 0, 0, null, 3.5, 'moved', [1.8], 0),
      CP(19, 0, 0, null, 8, 'died', [4.4], 1), CP(20, 0, 0, null, null, null, [8.8], 3)],
    cc: {
      pairs: [[1, 13], [2, 15], [3, 7], [10, 20], [4, 12], [11, 5]],     /* [case, its staff control], on the case's onset */
      fair: { date: 9, e: [0, 0, 1, 0, 0, 0] } },                        /* health-fair controls: the fair's date, and who drinks daily */
    trial: {
      start: 1,                                   /* the trial opens in 2017; each person's coin is at max(hired, start) */
      declined: [1, 8, 12, 14, 20],
      coin: { programme: [3, 4, 7, 11, 13, 17, 19], none: [2, 5, 6, 10, 15, 16, 18] },   /* 3 daily drinkers in each arm */
      choice: { programme: [5, 11, 13, 15, 16, 17, 19], none: [2, 3, 4, 6, 7, 10, 18] },
      stop: 0.5,                                  /* a drinker in the programme stops half a year after their coin */
      cut: [3, 4] }                               /* the programme works (Tonn, 7 November 2026): these drinkers' diabetes,
                                                     3 and 5 years after their coin, is put off past 2026 if they are in it;
                                                     row 2's starts half a year after, too soon to help. If all 14 cut: 3 of
                                                     14 get diabetes, against 5 of 14 as usual, a risk ratio of 0.6. The
                                                     coin's arms give 1 of 7 against 2 of 7 (0.50); by choice, 1 of 7
                                                     against 4 of 7 (0.25). Until then the programme did nothing, and the
                                                     coin's arms were 2, 5, 7, 11, 13, 17, 19 against the rest */
  };

  /* fill prose numbers from the same data as the widgets */
  const FILL = { N: String(N), TRUE_X: String(TRUE_X), prev0: pct1(S_C.pre.length / COHORT_C.length), prev12c: pct1(S_C.cases12.length / S_C.at12.length),
    risk: pct1(S_C.inc.length / S_C.free.length), ratec: (S_C.inc.length / S_C.py * 100).toFixed(1), py: S_D.py.toFixed(1) };
  $$('[data-fill]').forEach(e => { const v = FILL[e.getAttribute('data-fill')]; if (v != null) e.textContent = v; });

  Object.assign(window.SewnKit, {
    district: { N, CUT, gluc, diab, perm, TRUE_X, TRUE_P },
    cohort: { COHORT, COHORT_C, isCase, riskT, S_C, S_D },
    castle: CASTLE });
})();
