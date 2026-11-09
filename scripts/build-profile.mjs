import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const directory = new URL('assets/dossier/', root);
const site = 'https://vishvadharman-portfolio.vercel.app';
const profile = 'https://github.com/Vishvadharman';
const contributionPage = profile + '?tab=overview#js-contribution-activity';
const snake = 'https://raw.githubusercontent.com/Vishvadharman/Vishvadharman/output/snake.svg';
const email = 'mailto:vishvadharmansaminathan@gmail.com';

const contacts = [
  { id: 'portfolio', title: 'Portfolio', link: site + '/?build=1' },
  { id: 'linkedin', title: 'LinkedIn', link: 'https://www.linkedin.com/in/vishvasami23/' },
  { id: 'email', title: 'Email', link: email },
];

const groups = [
  {
    id: 'work', index: '01', title: 'Selected work', signal: 'DOCUMENT AI  /  MEMORY  /  VEHICLE SECURITY',
    entries: [
      {
        id: 'deviation', title: 'DeviationAI', tag: 'MAVDERO TECHSERVICES  /  DOCUMENT AI',
        body: 'Compares legal drafts against a reference and links each finding to the source wording.',
        link: 'https://deviation-ai-review.vercel.app/', action: 'OPEN DEMO', icon: 'document',
      },
      {
        id: 'brainvault', title: 'HippocampAI / BrainVault', tag: 'SANDISK HACKATHON  /  RUNNER-UP',
        body: 'Our team extended HippocampAI with encrypted memory on a USB drive so an assistant could pick up its context on another machine.',
        link: profile + '/Hippocamp-AI', action: 'VIEW CODE', icon: 'memory',
      },
      {
        id: 'kavach', title: 'KavachFusion', tag: 'ONGOING RESEARCH  /  VEHICLE SECURITY',
        body: 'Connects CAN bus alerts with trust scores from the wider vehicle network.',
        link: site + '/#work', action: 'PROJECT NOTES', icon: 'shield',
      },
      {
        id: 'wall-crack', title: 'Wall Crack Detection', tag: 'PYTORCH  /  COMPUTER VISION',
        body: 'Fine-tunes a ResNet-18 classifier on images of walls.',
        link: profile + '/Wall_Crack_Detection', action: 'VIEW CODE', icon: 'vision',
      },
    ],
  },
  {
    id: 'research', index: '02', title: 'Research & inventions', signal: 'JOURNAL  /  CONFERENCES  /  PATENT APPLICATIONS',
    entries: [
      {
        id: 'v2x', title: 'Federated learning for V2X', tag: 'FIRST AUTHOR  /  CMES 2026',
        body: 'We used SUMO traffic simulations to test how a shared accident detector responds to fake vehicle identities and poisoned model updates.',
        link: 'https://doi.org/10.32604/cmes.2026.086802', action: 'READ PAPER', icon: 'signal',
      },
      {
        id: 'accepted-papers', title: 'Cardiac models & emergency audio', tag: 'IEEE TENCON 2026  /  ICRTAC 2025',
        body: 'Two accepted papers on physics-informed models for cardiac electrophysiology and audio-based emergency dispatch.',
        link: site + '/#research', action: 'RESEARCH NOTES', icon: 'signal',
      },
      {
        id: 'patent-applications', title: 'Two published patent applications', tag: 'INDIAN PATENT OFFICE  /  CO-INVENTOR',
        body: 'IN202641083839 A1 covers adversarial attacks in federated learning. IN202641086137 A1 covers elevator bio-safety.',
        link: site + '/#research', action: 'INVENTION NOTES', icon: 'document',
      },
    ],
  },
  {
    id: 'open-source', index: '03', title: 'Open source', signal: 'GIRLSCRIPT SUMMER OF CODE  /  2026',
    entries: [
      {
        id: 'commitpulse', title: 'CommitPulse', tag: 'MERGED PULL REQUEST  /  #1853',
        body: 'I tested the streak calculation against a large spike in one day’s commits.',
        link: 'https://github.com/JhaSourav07/commitpulse/pull/1853', action: 'VIEW PATCH', icon: 'signal',
      },
      {
        id: 'secuscan', title: 'SecuScan', tag: 'MERGED PULL REQUEST  /  #779',
        body: 'I added parser and contract tests for the URL fuzzer.',
        link: 'https://github.com/utksh1/SecuScan/pull/779', action: 'VIEW PATCH', icon: 'shield',
      },
      {
        id: 'toolkit', title: 'Working toolkit', tag: 'TOOLS I REACH FOR',
        body: 'Python · PyTorch · FastAPI · Next.js · Redis · Qdrant · Docker',
        icon: 'memory',
      },
    ],
  },
];

const intro = {
  id: 'intro', title: 'About me', tag: 'VIT CHENNAI  /  MAVDERO TECHSERVICES',
  body: 'I’m in my final year of B.Tech in AI and ML at VIT Chennai. As an AI intern at Mavdero TechServices, I work on document comparison and care about whether a reviewer can trace a flagged change back to the source.',
  link: site + '/#about', action: 'ABOUT ME', icon: 'vision',
};

const glyphs = {
  document: 'M12 5h24l11 11v35H12z M36 5v12h11 M19 25h21 M19 32h21 M19 39h13',
  memory: 'M14 15h28v28H14z M21 22h14v14H21z M19 8v7 M28 8v7 M37 8v7 M19 43v7 M28 43v7 M37 43v7 M7 20h7 M7 29h7 M7 38h7 M42 20h7 M42 29h7 M42 38h7',
  shield: 'M28 6l19 8v13c0 11-7 18-19 25C16 45 9 38 9 27V14z M19 28l6 6 12-13',
  vision: 'M7 19V8h11 M38 8h11v11 M49 37v11H38 M18 48H7V37 M10 28c11-16 25-16 36 0-11 16-25 16-36 0z M32 28a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  signal: 'M7 44h42 M7 8v36 M9 35l10-7 7 6 8-19 7 7 7-11',
};

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function widthOf(text, size, bold = false) {
  return [...text].reduce((sum, char) => {
    const factor = "ilI.,'!: ".includes(char) ? .29
      : 'MW@%'.includes(char) ? .9
      : /[A-Z0-9]/.test(char) ? .66 : .55;
    return sum + size * factor * (bold ? 1.075 : 1.04);
  }, 0);
}

function wrap(text, size, maxWidth, bold = false) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? line + ' ' + word : word;
    if (line && widthOf(next, size, bold) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function scene(width, height, description, period, accent = '#8bc8df', phase = .16) {
  const defs = [];
  const content = [];
  const cursors = [];
  let count = 0;
  const t = seconds => (seconds / period).toFixed(6);
  const motion = (attribute, values, times, discrete = false) =>
    '<animate attributeName="' + attribute + '" dur="' + period + 's" repeatCount="indefinite" values="' +
      values.join(';') + '" keyTimes="' + times.map(t).join(';') + '"' + (discrete ? ' calcMode="discrete"' : '') + '/>';
  function line(text, x, y, size, { bold = false, color = '#dae5eb', delay = .25, cursor = true, mono = false } = {}) {
    const id = 'reveal-' + ++count;
    const family = mono ? 'Consolas, ui-monospace, monospace' : 'system-ui, Segoe UI, sans-serif';
    const start = phase + delay;
    const span = Math.min(.96, Math.max(.24, text.length * .021));
    const characters = [...text];
    const increments = characters.map((_, index) => {
      const part = characters.slice(0, index + 1).join('');
      return Math.min(width - x, Math.round(widthOf(part, size, bold) * 1.08));
    });
    const full = width - x;
    const typeTimes = [0, phase, start, ...characters.map((_, index) => start + (index + 1) * span / characters.length), period];
    const typeWidths = [full, 0, 0, ...increments.slice(0, -1), full, full];
    defs.push('<clipPath id="' + id + '"><rect x="' + x + '" y="' + (y - size * 1.14) +
      '" width="' + full + '" height="' + (size * 1.53) + '">' + motion('width', typeWidths, typeTimes, true) + '</rect></clipPath>');
    const label = '<text x="' + x + '" y="' + y + '" fill="' + color + '" font-family="' + family +
      '" font-size="' + size + '" font-weight="' + (bold ? '700' : '450') + '">' + escape(text) + '</text>';
    content.push('<g class="animated" clip-path="url(#' + id + ')">' + label + '</g><g class="still">' + label + '</g>');
    if (cursor) {
      const xs = [x, x, x, ...increments.map(value => Math.min(width - 7, x + value)), x];
      cursors.push('<rect x="' + x + '" y="' + (y - size * .77) + '" width="2" height="' + (size * .96) +
        '" fill="#a8ddeb" opacity="0">' + motion('x', xs, typeTimes, true) +
        motion('opacity', [0, .9, .9, 0, 0], [0, start, start + span * .91, start + span + .11, period]) + '</rect>');
    }
  }
  function finish() {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-labelledby="title">',
      '<title id="title">' + escape(description) + '</title>',
      '<style>.still{display:none}@media(prefers-reduced-motion:reduce){.animated{display:none}.still{display:inline}}</style>',
      '<defs><linearGradient id="surface" x2="1" y2="1"><stop stop-color="#0b1015"/><stop offset="1" stop-color="#14212a"/></linearGradient>',
      '<linearGradient id="sweep"><stop stop-color="' + accent + '" stop-opacity="0"/><stop offset=".86" stop-color="' + accent + '" stop-opacity=".64"/><stop offset="1" stop-color="#edf9ff"/></linearGradient>',
      ...defs,
      '</defs>',
      '<rect x=".5" y=".5" width="' + (width - 1) + '" height="' + (height - 1) + '" rx="10" fill="url(#surface)" stroke="#345060"/>',
      '<path d="M0 ' + Math.floor(height * .7) + 'h' + width + '" stroke="#8eb0c4" stroke-opacity=".05"/>',
      '<g class="animated"><rect x="-168" y="1" width="168" height="2" rx="1" fill="url(#sweep)">' +
        motion('x', [-168, width, width], [0, period * .61, period]) + '</rect></g>',
      ...content,
      '<g class="animated">' + cursors.join('\n') + '</g>',
      '</svg>',
    ].join('\n') + '\n';
  }
  return { line, finish, content, motion };
}

function projectCard(item, width, index, accent) {
  const narrow = width === 420;
  const x = narrow ? 20 : 29;
  const titleSize = narrow ? 29 : 36;
  const bodySize = narrow ? 20 : 22;
  const badge = narrow ? 11 : 13;
  const tagWidth = width - 2 * x - (narrow ? 34 : 86);
  const tagLines = wrap(item.tag, badge * 1.14, tagWidth, true);
  const titleLines = wrap(item.title, titleSize, width - 2 * x - (narrow ? 4 : 92), true);
  const bodyLines = wrap(item.body, bodySize, width - 2 * x - (narrow ? 0 : 84));
  const titleY = 65 + (tagLines.length - 1) * 17;
  const bodyY = titleY + (titleLines.length - 1) * (titleSize + 3) + (narrow ? 34 : 35);
  const lineHeight = narrow ? 28 : 30;
  const bottom = bodyY + (bodyLines.length - 1) * lineHeight;
  const height = bottom + (item.action ? 64 : 26);
  const period = 10.4 + (index % 4) * .62;
  const phase = .21 + (index % 5) * .39;
  const picture = scene(width, height, [item.title, item.tag, item.body, item.action].filter(Boolean).join('. '), period, accent, phase);
  if (item.icon) {
    const size = narrow ? .48 : .92;
    const left = narrow ? width - 52 : width - 86;
    picture.content.push(
      '<g transform="translate(' + left + ' ' + (narrow ? 13 : 31) + ') scale(' + size + ')" fill="none" stroke="' + accent + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      '<path opacity=".15" d="' + glyphs[item.icon] + '"/><path class="animated" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0" opacity=".74" d="' +
      glyphs[item.icon] + '">' + picture.motion('stroke-dashoffset', [100, 100, 0, 0], [0, .18, 1.47, period]) + '</path></g>'
    );
  }
  tagLines.forEach((text, i) => picture.line(text, x, 29 + i * 17, badge, { color:'#93bdcc', mono:true, bold:true, delay:.17 + i * .13, cursor:false }));
  titleLines.forEach((text, i) => picture.line(text, x, titleY + i * (titleSize + 3), titleSize, { color:'#f3f6f8', bold:true, delay:.35 + i * .26 }));
  bodyLines.forEach((text, i) => picture.line(text, x, bodyY + i * lineHeight, bodySize, { delay:.83 + titleLines.length * .20 + i * .23 }));
  if (item.action) {
    const label = item.action + (item.link.startsWith('mailto:') ? '' : ' ↗');
    picture.content.push('<path d="M' + x + ' ' + (bottom + 19) + 'h' + (width - 2 * x) + '" stroke="#355565"/>');
    picture.line(label, x, bottom + 42, badge + 1, { color:'#ade2f1', mono:true, bold:true, delay:1.6 + bodyLines.length * .15 });
  }
  return picture.finish();
}

function sectionCard(section, width, accent) {
  const narrow = width === 420;
  const x = narrow ? 20 : 29;
  const size = narrow ? 34 : 44;
  const height = narrow ? 134 : 144;
  const picture = scene(width, height, section.title + '. ' + section.signal, 12.3, accent, .44 * Number(section.index));
  picture.content.push('<path d="M' + x + ' ' + (height - 20) + 'h' + (width - 2 * x) + '" stroke="#385766" stroke-opacity=".8"/>');
  if (!narrow) {
    picture.content.push('<path d="M775 25h154v88H775z M796 25v88 M908 25v88" fill="none" stroke="' + accent + '" opacity=".18"/>');
    picture.line(section.index, 809, 95, 65, { color:accent, mono:true, bold:true, delay:.51, cursor:false });
  }
  picture.line(section.index + '  /  VISHVA', x, 28, narrow ? 12 : 13, { color:accent, mono:true, bold:true, delay:.13, cursor:false });
  picture.line(section.title, x, narrow ? 70 : 77, size, { color:'#f3f6f8', bold:true, delay:.34 });
  picture.line(section.signal, x, narrow ? 99 : 109, narrow ? 10 : 13, { color:'#add3e1', mono:true, bold:true, delay:1.11, cursor:false });
  return picture.finish();
}

function contactCard(contact) {
  const picture = scene(300, 56, contact.title, 10.7);
  picture.content.push('<circle cx="18" cy="28" r="3" fill="#8de0c1"/>');
  picture.line(contact.title.toUpperCase() + '  ↗', 30, 36, 21, { color:'#e5f4fa', mono:true, bold:true, delay:.23 });
  return picture.finish();
}

async function readContributionGrid() {
  const response = await fetch('https://github.com/users/Vishvadharman/contributions', { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('GitHub contribution calendar returned HTTP ' + response.status);
  const html = await response.text();
  const days = new Map([...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})" id="(contribution-day-component-\d+-\d+)"/g)].map(([, date, id]) => [id, date]));
  const values = [...html.matchAll(/<tool-tip[^>]*for="(contribution-day-component-\d+-\d+)"[^>]*>(No|[\d,]+) contributions? on /gi)].map(([, id, count]) => {
    if (!days.has(id)) throw new Error('Contribution tooltip has no date.');
    return { date: days.get(id), week: Number(id.split('-').at(-1)), count: count.toLowerCase() === 'no' ? 0 : Number(count.replaceAll(',', '')) };
  }).sort((a, b) => a.date.localeCompare(b.date));
  if (values.length < 350 || values.length !== days.size) throw new Error('Could not verify contribution counts.');
  const weeks = Array.from({ length: 54 }, () => 0);
  for (const day of values) weeks[day.week] += day.count;
  return { weeks: weeks.slice(0, Math.max(...values.map(day => day.week)) + 1), total: values.reduce((sum, day) => sum + day.count, 0), date: values.at(-1).date };
}

function activityCard(data, width) {
  const narrow = width === 420;
  const x = narrow ? 20 : 29;
  const height = narrow ? 220 : 235;
  const total = data.total.toLocaleString('en-US');
  const date = new Intl.DateTimeFormat('en-US', { year:'numeric', month:'short', day:'numeric', timeZone:'UTC' }).format(new Date(data.date + 'T00:00:00Z')).toUpperCase();
  const title = total + ' public contributions';
  const picture = scene(width, height, title + ' in the last year. Snapshot ' + date + '.', 12.4);
  picture.line('04  /  GITHUB ACTIVITY', x, 29, narrow ? 12 : 13, { color:'#93bdcc', mono:true, bold:true, delay:.15 });
  picture.line(title, x, 77, narrow ? 30 : 40, { color:'#f3f6f8', bold:true, delay:.38 });
  const base = height - 49;
  const slot = (width - 2 * x) / data.weeks.length;
  const maximum = Math.max(1, ...data.weeks);
  data.weeks.forEach((count, i) => {
    const bar = Math.max(2, Math.round(Math.sqrt(count / maximum) * 67));
    const left = (x + i * slot).toFixed(2);
    const barWidth = Math.max(2, slot - (narrow ? 1.4 : 3)).toFixed(2);
    const delay = .66 + i * .021;
    const rect = '<rect x="' + left + '" y="' + (base - bar) + '" width="' + barWidth + '" height="' + bar + '" rx="1.4" fill="' + (count ? '#72b9ce' : '#2d4a58') + '"';
    picture.content.push(rect + ' class="still"/>', rect + ' class="animated">' +
      picture.motion('height', [0, 0, bar, bar], [0, delay, delay + .31, 12.4]) +
      picture.motion('y', [base, base, base - bar, base - bar], [0, delay, delay + .31, 12.4]) + '</rect>');
  });
  picture.line('WEEKLY ACTIVITY  /  SNAPSHOT ' + date, x, height - 19, narrow ? 11 : 13, { color:'#aed0dd', mono:true, bold:true, delay:1.5, cursor:false });
  return picture.finish();
}

const path = id => 'assets/dossier/' + id + '.svg';
const mobilePath = id => 'assets/dossier/' + id + '-mobile.svg';
function embed(id, alt, link) {
  const tag = '<picture><source media="(prefers-reduced-motion: reduce) and (max-width: 767px)" srcset="' + path(id + '-mobile-still') +
    '"><source media="(prefers-reduced-motion: reduce)" srcset="' + path(id + '-still') +
    '"><source media="(max-width: 767px)" srcset="' + mobilePath(id) +
    '"><img width="100%" src="' + path(id) + '" alt="' + escape(alt) + '"></picture>';
  return link ? '<a href="' + escape(link) + '">' + tag + '</a>' : tag;
}
const fullAlt = item => item.title + '. ' + item.tag + '. ' + item.body + (item.action ? ' ' + item.action + '.' : '');
const transcript = item => '**' + (item.link ? '[' + item.title + '](' + item.link + ')' : item.title) + '**. ' + item.body;

const grid = await readContributionGrid();
await mkdir(directory, { recursive:true });
let order = 0;
const accents = ['#8bc8df', '#b5adf4', '#8bdec6'];
for (const width of [960, 420]) {
  const suffix = width === 420 ? '-mobile' : '';
  const save = async (id, svg) => {
    await writeFile(new URL(id + suffix + '.svg', directory), svg);
    const still = svg.replace(/<animate\b[^>]*\/>/g, '').replace(/<style>.*?<\/style>/, '<style>.animated{display:none}</style>');
    await writeFile(new URL(id + suffix + '-still.svg', directory), still);
  };
  await save(intro.id, projectCard(intro, width, order++, accents[0]));
  for (const [index, group] of groups.entries()) {
    await save(group.id, sectionCard(group, width, accents[index]));
    for (const item of group.entries) await save(item.id, projectCard(item, width, order++, accents[index]));
  }
  await save('activity', activityCard(grid, width));
}
for (const contact of contacts) await writeFile(new URL(contact.id + '.svg', directory), contactCard(contact));

const cover = [
  '<a href="' + site + '/?build=1">',
  '  <picture>',
  '    <source media="(prefers-reduced-motion: reduce)" srcset="assets/portfolio-cover.png">',
  '    <img width="100%" src="assets/portfolio-build.gif" alt="Four agents build Vishvadharman Saminathan’s profile cover. AI, research and engineering.">',
  '  </picture>',
  '</a>',
].join('\n');
const buttons = contacts.map(contact => '<a href="' + contact.link + '"><img width="31%" src="' + path(contact.id) + '" alt="' + contact.title + '"></a>').join(' ');
const plainText = [
  '<details><summary>Text version and links</summary>',
  '',
  transcript(intro),
  '',
  ...groups.flatMap(group => ['### ' + group.title, '', ...group.entries.flatMap(item => [transcript(item), ''])]),
  contacts.map(contact => '[' + contact.title + '](' + contact.link + ')').join(' · ') + ' · [Live contribution activity](' + contributionPage + ')',
  '',
  '</details>',
].join('\n');
const readme = [
  '<!-- Generated by scripts/build-profile.mjs. Edit the source to refresh the cards and text version. -->',
  cover,
  '<a href="' + site + '/?build=1"><img width="100%" src="assets/build-signal.svg" alt="Now building document AI, researching trustworthy AI, and contributing to open source"></a>',
  '<p align="center">' + buttons + '</p>',
  embed(intro.id, fullAlt(intro), intro.link),
  ...groups.flatMap(group => [embed(group.id, group.title + '. ' + group.signal), ...group.entries.map(item => embed(item.id, fullAlt(item), item.link))]),
  embed('activity', 'GitHub activity. ' + grid.total + ' public contributions in the last year. Snapshot ' + grid.date + '.', contributionPage),
  '<img width="100%" src="' + snake + '" alt="Animated snake tracing Vishvadharman’s GitHub contributions">',
  plainText,
].join('\n\n') + '\n';
await writeFile(new URL('README.md', root), readme);
console.log('Generated the animated profile in ' + fileURLToPath(directory));
