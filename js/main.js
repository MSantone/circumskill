/* Circumskill — site behaviour: nav, copy buttons, hero counter, playground. */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Nav toggle ---------------- */
  const toggle = $('.nav-toggle');
  const links = $('#nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------- Copy to clipboard ---------------- */
  const toast = $('#toast');
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }
  $$('[data-copy]').forEach((el) => {
    el.addEventListener('click', async () => {
      const text = el.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard');
      } catch {
        showToast('Copy failed — select the text manually');
      }
    });
  });

  /* ---------------- Footer year ---------------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------- Hero token counter ---------------- */
  const counter = $('#hero-counter strong');
  if (counter) {
    const from = Number(counter.dataset.from);
    const to = Number(counter.dataset.to);
    const fmt = (n) => n.toLocaleString('en-US');
    if (reduceMotion) {
      counter.textContent = fmt(to);
    } else {
      // Start after the strike-through animation has begun, run while lines collapse.
      const delay = 1400;
      const duration = 3000;
      setTimeout(() => {
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          counter.textContent = fmt(Math.round(from + (to - from) * ease(t)));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, delay);
    }
  }

  /* ---------------- Playground ---------------- */
  const SAMPLE = `---
name: release-notes
description: This skill is designed to help you write release notes. It is very important
  to use it whenever the user asks for release notes, a changelog, or a summary of changes.
  Please note that you should always follow the steps below carefully.
---

## Overview

Please note that writing release notes is a very important task. This skill helps you
produce clear, well-structured release notes. Remember to always be careful and thorough
at all times. Thank you!

## Instructions

1. In order to begin, you should first run \`git log --oneline v1..HEAD\` to see the commits.
2. Make sure to group the commits into: Added, Changed, Fixed, Removed.
3. It is important to note that you should write each entry in the imperative mood.
4. As mentioned above, group the commits into Added, Changed, Fixed, and Removed.
5. Please make sure that you always link each entry to its pull request if you want to.
6. Basically, keep entries short. Feel free to omit internal refactors.
7. Remember to always write each entry in the imperative mood.


## Output format

Please note: Output Markdown with a \`## vX.Y.Z — YYYY-MM-DD\` heading, then one
\`### Added\` / \`### Changed\` / \`### Fixed\` / \`### Removed\` section per group.
It is highly recommended that you omit empty sections.

Thank you for using this skill!
`;

  // Each rule: [pattern, replacement, label]. Labels are tallied for the report.
  // Trailing whitespace is matched with [ \t]* so a removal never swallows a line break.
  const RULES = [
    [/\bplease note that\b[,:]?[ \t]*/gi, '', 'hedges'],
    [/\bplease note:?[ \t]*/gi, '', 'hedges'],
    [/\bit is (very |highly )?(important|crucial|essential|vital|recommended)( to note)?\s+(that you should|that you|that|to)\s+/gi, '', 'hedges'],
    [/\b(please )?(make sure (to|that you)|be sure to|ensure that you|remember to|don't forget to|always remember to)\s+/gi, '', 'hedges'],
    [/\byou should (always |first )?/gi, '', 'hedges'],
    [/\bas (mentioned|noted|stated|described) (above|earlier|previously|before),?[ \t]*/gi, '', 'hedges'],
    [/\bin order to\b/gi, 'to', 'filler'],
    [/\b(basically|essentially|simply|really|very|quite|rather|actually),?[ \t]+/gi, '', 'filler'],
    [/[ \t]*\bat all times\b/gi, '', 'filler'],
    [/\bif you want to,?[ \t]*/gi, '', 'filler'],
    [/\bfeel free to\s+/gi, '', 'filler'],
    [/\bthis skill (is designed to\s+|helps you\s+|allows you to\s+|enables you to\s+|will\s+)?(help you\s+)?/gi, '', 'boilerplate'],
    [/\bthank you( for (using )?(this skill|\w+))?[.!]?[ \t]*/gi, '', 'boilerplate'],
    [/\bto begin,[ \t]*/gi, '', 'boilerplate'],
  ];
  const STOPWORDS = /\b(always|and|also|then|the|a|an|please|all|of)\b/g;

  const input = $('#pg-input');
  const output = $('#pg-output');
  const before = $('#pg-before');
  const after = $('#pg-after');
  const saved = $('#pg-saved');
  const report = $('#pg-report');
  const runBtn = $('#pg-run');
  const resetBtn = $('#pg-reset');

  const estimateTokens = (s) => Math.ceil(s.trim().length / 4);
  const fmt = (n) => n.toLocaleString('en-US');

  const isHeading = (l) => /^#{1,6}\s/.test(l);
  const headingLevel = (l) => (l.match(/^(#{1,6})\s/) || [, ''])[1].length;
  const listKey = (l) => l.replace(/^\s*(\d+\.|[-*])\s+/, '').toLowerCase().replace(STOPWORDS, '').replace(/[^\w]/g, '');

  function capitalize(line, startsParagraph) {
    if (/^\s*[#\u0000]/.test(line)) return line; // headings and protected code
    let out = line.replace(/([.!?]\s+)([a-z])/g, (m, pre, ch) => pre + ch.toUpperCase());
    const m = out.match(/^(\s*(?:\d+\.|[-*])\s+)([a-z])/);
    if (m) return m[1] + m[2].toUpperCase() + out.slice(m[0].length);
    if (startsParagraph) out = out.replace(/^(\s*)([a-z])/, (mm, ws, ch) => ws + ch.toUpperCase());
    return out;
  }

  function tidy(s) {
    return s
      .replace(/(\S)[ \t]{2,}/g, '$1 ')      // collapse internal runs, keep indentation
      .replace(/\s+([.!?,;:])/g, '$1')         // "word ." / "word\n." -> "word."
      .replace(/,([.!?])/g, '$1')
      .replace(/\(\s*\)/g, '')
      .replace(/\b([Aa]) (?=[aeio])/g, '$1n ') // "a important" -> "an important"
      .replace(/[ \t]+$/gm, '');
  }

  function trim(text) {
    const tally = { hedges: 0, filler: 0, boilerplate: 0, duplicates: 0, empty: 0, blank: 0 };

    // Protect code (fenced blocks and inline spans) so rules never touch it.
    const protectedBits = [];
    const protect = (m) => { protectedBits.push(m); return `\u0000${protectedBits.length - 1}\u0000`; };
    let out = text.replace(/<!--[\s\S]*?-->/g, '');
    out = out.replace(/```[\s\S]*?```/g, protect).replace(/`[^`\n]+`/g, protect);

    // Split YAML front matter off; it gets the rules but no sentence-level editing.
    let front = '';
    const fm = out.match(/^---\n[\s\S]*?\n---\n?/);
    if (fm) { front = fm[0]; out = out.slice(fm[0].length); }

    const applyRules = (s) => {
      for (const [re, rep, label] of RULES) {
        s = s.replace(re, () => { tally[label]++; return rep; });
      }
      return tidy(s);
    };
    front = applyRules(front).replace(/([.!?]\s+)([a-z])/g, (m, pre, ch) => pre + ch.toUpperCase());
    out = applyRules(out);

    // Drop lines left with no content, and duplicate lines (ignoring stopwords).
    const seen = new Set();
    let lines = out.split('\n').filter((raw) => {
      const line = raw.trim();
      if (line === '') return true;
      const key = listKey(line);
      if (key === '') { tally.empty++; return false; }
      if (key.length > 12 && seen.has(key)) { tally.duplicates++; return false; }
      seen.add(key);
      return true;
    });

    // Drop headings whose section is empty (next non-blank line is a heading of
    // the same or higher level, or there is nothing after it).
    lines = lines.filter((line, i) => {
      if (!isHeading(line)) return true;
      const next = lines.slice(i + 1).find((l) => l.trim() !== '');
      if (next === undefined || (isHeading(next) && headingLevel(next) <= headingLevel(line))) {
        tally.empty++;
        return false;
      }
      return true;
    });

    // Renumber ordered lists so gaps from removed items don't show, and
    // capitalize sentence starts that removals may have exposed.
    let n = 0;
    let prevBlank = true;
    let prevEndsSentence = false;
    lines = lines.map((line) => {
      const blank = line.trim() === '';
      let res = line;
      const m = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (m) { n += 1; res = `${m[1]}${n}. ${m[3]}`; }
      if (blank || isHeading(line)) n = 0;
      res = capitalize(res, prevBlank || prevEndsSentence || isHeading(line));
      prevBlank = blank || isHeading(line);
      prevEndsSentence = /[.!?]$/.test(line.trim());
      return res;
    });

    out = lines.join('\n').replace(/\n{3,}/g, () => { tally.blank++; return '\n\n'; }).trim();

    let result = (front ? front.trimEnd() + '\n\n' : '') + out + '\n';
    result = result.replace(/\u0000(\d+)\u0000/g, (m, i) => protectedBits[Number(i)]);
    return { text: result, tally };
  }

  function render() {
    if (!input || !output) return;
    const src = input.value;
    const { text, tally } = trim(src);
    const b = estimateTokens(src);
    const a = estimateTokens(text);
    output.textContent = text;
    before.textContent = fmt(b);
    after.textContent = fmt(a);
    const pct = b ? Math.round(((b - a) / b) * 100) : 0;
    saved.textContent = pct > 0 ? `−${pct}%` : '';

    const labels = {
      hedges: 'hedges removed',
      filler: 'filler words cut',
      boilerplate: 'boilerplate dropped',
      duplicates: 'duplicate lines collapsed',
      empty: 'empty lines/sections removed',
      blank: 'blank runs collapsed',
    };
    report.innerHTML = '';
    Object.keys(labels).forEach((k) => {
      if (tally[k] > 0) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${tally[k]}</strong> ${labels[k]}`;
        report.appendChild(li);
      }
    });
    if (!report.children.length && src.trim()) {
      const li = document.createElement('li');
      li.textContent = 'Nothing to cut. This skill is already lean.';
      report.appendChild(li);
    }
  }

  if (input) {
    input.value = SAMPLE;
    render();
    input.addEventListener('input', () => { before.textContent = fmt(estimateTokens(input.value)); });
    runBtn && runBtn.addEventListener('click', render);
    resetBtn && resetBtn.addEventListener('click', () => { input.value = SAMPLE; render(); });
  }
})();
