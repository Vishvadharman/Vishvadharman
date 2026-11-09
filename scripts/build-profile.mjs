import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const cardFolder = 'assets/profile-spectrum/';
const directory = new URL(cardFolder, root);
const font = await readFile(new URL('./fonts/SpaceGrotesk.woff2', import.meta.url));
const fontFace = '@font-face{font-family:Space Grotesk;src:url(data:font/woff2;base64,' +
  font.toString('base64') + ') format("woff2");font-weight:300 700;font-display:swap}';

const themes = {
  intro: { accent:'#ffaf9d', highlight:'#ffd28b', surface:'#241927' },
  work: { accent:'#83ddff', highlight:'#9aaeff', surface:'#14253c' },
  research: { accent:'#d6b8ff', highlight:'#ffb4e4', surface:'#281b3b' },
  'open-source': { accent:'#83edbb', highlight:'#8bdeed', surface:'#142c2b' },
  activity: { accent:'#ffd689', highlight:'#91e6b9', surface:'#29261e' },
};
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
        id: 'deviation-overview', title: 'DeviationAI', tag: 'MAVDERO TECHSERVICES  /  DOCUMENT AI',
        body: 'Compares legal drafts against a reference and links each finding to the source wording.',
        icon: 'document',
      },
      {
        id: 'brainvault', title: 'HippocampAI / BrainVault', tag: 'SANDISK HACKATHON  /  RUNNER-UP',
        body: 'Our team extended HippocampAI with encrypted memory on a USB drive so an assistant could pick up its context on another machine.',
        link: profile + '/Hippocamp-AI', action: 'View code', icon: 'memory',
      },
      {
        id: 'kavach', title: 'KavachFusion', tag: 'ONGOING RESEARCH  /  VEHICLE SECURITY',
        body: 'Connects CAN bus alerts with trust scores from the wider vehicle network.',
        link: site + '/#work', action: 'Project notes', icon: 'shield',
      },
      {
        id: 'wall-crack', title: 'Wall Crack Detection', tag: 'PYTORCH  /  COMPUTER VISION',
        body: 'Fine-tunes a ResNet-18 classifier on images of walls.',
        link: profile + '/Wall_Crack_Detection', action: 'View code', icon: 'vision',
      },
    ],
  },
  {
    id: 'research', index: '02', title: 'Research & inventions', signal: 'JOURNAL  /  CONFERENCES  /  PATENT APPLICATIONS',
    entries: [
      {
        id: 'v2x', title: 'Federated learning for V2X', tag: 'FIRST AUTHOR  /  CMES 2026',
        body: 'We used SUMO traffic simulations to test how a shared accident detector responds to fake vehicle identities and poisoned model updates.',
        link: 'https://doi.org/10.32604/cmes.2026.086802', action: 'Read paper', icon: 'signal',
      },
      {
        id: 'accepted-papers', title: 'Cardiac models & emergency audio', tag: 'IEEE TENCON 2026  /  ICRTAC 2025',
        body: 'Two accepted papers on physics-informed models for cardiac electrophysiology and audio-based emergency dispatch.',
        link: site + '/#research', action: 'Research notes', icon: 'signal',
      },
      {
        id: 'patent-applications', title: 'Two published patent applications', tag: 'INDIAN PATENT OFFICE  /  CO-INVENTOR',
        body: 'IN202641083839 A1 covers adversarial attacks in federated learning. IN202641086137 A1 covers elevator bio-safety.',
        link: site + '/#research', action: 'Invention notes', icon: 'document',
      },
    ],
  },
  {
    id: 'open-source', index: '03', title: 'Open source', signal: 'GIRLSCRIPT SUMMER OF CODE  /  2026',
    entries: [
      {
        id: 'commitpulse', title: 'CommitPulse', tag: 'MERGED PULL REQUEST  /  #1853',
        body: 'I tested the streak calculation against a large spike in one day’s commits.',
        link: 'https://github.com/JhaSourav07/commitpulse/pull/1853', action: 'View patch', icon: 'signal',
      },
      {
        id: 'secuscan', title: 'SecuScan', tag: 'MERGED PULL REQUEST  /  #779',
        body: 'I added parser and contract tests for the URL fuzzer.',
        link: 'https://github.com/utksh1/SecuScan/pull/779', action: 'View patch', icon: 'shield',
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
  link: site + '/#about', action: 'About me', icon: 'vision',
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

function scene(width, height, description, period, theme, phase = .16, kind = 'row') {
  const { accent, highlight, surface } = theme;
  const content = [];
  const textLayers = [];
  const t = seconds => (seconds / period).toFixed(6);
  const track = (attribute, values, times) =>
    '<animate attributeName="' + attribute + '" dur="' + period + 's" repeatCount="indefinite" values="' +
      values.join(';') + '" keyTimes="' + times.map(t).join(';') + '"/>';
  const band = Math.round(width * .27);
  const scan = (offset = 0) => {
    const start = -band + offset;
    const end = width + band + offset;
    return [start, start, end, end];
  };
  const scanTimes = [0, phase, phase + period * .54, period];
  function line(text, x, y, size, {
    weight = 400, color = '#d6d8e6', spacing = 0, shine = weight >= 600 ? .75 : .52, align = 'start',
  } = {}) {
    const label = '<text x="' + x + '" y="' + y + '" text-anchor="' + align +
      '" font-family="Space Grotesk, Segoe UI, sans-serif" font-size="' + size +
      '" font-weight="' + weight + '" letter-spacing="' + spacing + 'em"';
    const words = '>' + escape(text) + '</text>';
    textLayers.push(label + ' fill="' + color + '"' + words);
    if (shine) textLayers.push(label + ' class="animated" fill="url(#word-light)" opacity="' + shine + '"' + words);
  }
  function finish() {
    const divider = kind === 'divider';
    const prominent = kind === 'lead' || kind === 'activity';
    const inset = width === 420 ? 20 : 28;
    const railY = divider ? height - 5 : prominent ? 1 : height - 1;
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-labelledby="title">',
      '<title id="title">' + escape(description) + '</title>',
      '<style>' + fontFace + '@media(prefers-reduced-motion:reduce){.animated{display:none}}</style>',
      '<defs>',
      '<linearGradient id="surface" x1="0%" y1="100%" x2="100%" y2="0%"><stop stop-color="#10131f"/><stop offset="1" stop-color="' + surface + '"/></linearGradient>',
      '<linearGradient id="edge"><stop stop-color="' + accent + '"/><stop offset="1" stop-color="' + highlight + '" stop-opacity=".42"/></linearGradient>',
      '<linearGradient id="word-light" gradientUnits="userSpaceOnUse" x1="' + (-band) + '" x2="0" y1="0" y2="0">' +
        '<stop stop-color="' + accent + '" stop-opacity="0"/><stop offset=".42" stop-color="' + accent + '" stop-opacity=".78"/>' +
        '<stop offset=".62" stop-color="' + highlight + '" stop-opacity=".96"/><stop offset="1" stop-color="' + highlight + '" stop-opacity="0"/>' +
        track('x1', scan(), scanTimes) + track('x2', scan(band), scanTimes) + '</linearGradient>',
      '</defs>',
      divider ? '' : '<rect x=".5" y=".5" width="' + (width - 1) + '" height="' + (height - 1) + '" rx="' + (prominent ? 14 : 9) +
        '" fill="' + (prominent || kind === 'link' ? 'url(#surface)' : '#111521') +
        '" stroke="url(#edge)" stroke-opacity="' + (prominent ? '.48' : '.27') + '"/>',
      prominent ? '<path d="M' + inset + ' 2h' + Math.round(width * .19) + '" stroke="url(#edge)" stroke-width="3" stroke-linecap="round"/>' : '',
      kind === 'link' ? '' : '<path d="M' + inset + ' ' + railY + 'H' + (width - inset) + '" stroke="' + accent + '" stroke-opacity="' +
        (divider ? '.56' : '.13') + '"/><path class="animated" d="M' + inset + ' ' + railY + 'H' + (width - inset) +
        '" stroke="url(#word-light)" stroke-width="' + (divider ? 2 : 1) + '"/>',
      ...content,
      ...textLayers,
      '</svg>',
    ].filter(Boolean).join('\n') + '\n';
  }
  return { line, finish, content, track };
}

function projectCard(item, width, index, theme) {
  const { accent, highlight } = theme;
  const narrow = width === 420;
  const featured = ['intro', 'deviation-overview', 'v2x'].includes(item.id);
  const x = narrow ? 20 : 28;
  const titleSize = featured ? (narrow ? 33 : 45) : (narrow ? 29 : 34);
  const bodySize = narrow ? 20 : 22;
  const badge = narrow ? 13 : 15;
  const tagLines = wrap(item.tag, badge + 1, width - 2 * x - 48, true);
  const titleLines = wrap(item.title, titleSize, width - 2 * x - (featured && !narrow ? 171 : 48), true);
  const bodyLines = wrap(item.body, bodySize, width - 2 * x - (narrow ? 0 : featured ? 190 : item.action ? 174 : 60));
  const titleY = (featured ? 68 : 60) + (tagLines.length - 1) * 17;
  const bodyY = titleY + (titleLines.length - 1) * (titleSize + 3) + (featured ? 34 : 30);
  const lineHeight = narrow ? 26 : 29;
  const bottom = bodyY + (bodyLines.length - 1) * lineHeight;
  const actionBelow = item.action && (narrow || featured);
  const height = bottom + (actionBelow ? 55 : 23);
  const period = 8.3 + (index % 4) * .76;
  const phase = .22 + (index % 5) * .48;
  const picture = scene(width, height, [item.title, item.tag, item.body, item.action].filter(Boolean).join('. '), period, theme, phase, featured ? 'lead' : 'row');
  if (item.icon) {
    const large = featured && !narrow;
    const scale = large ? 1.14 : narrow ? .46 : .59;
    const left = width - x - (large ? 99 : 56 * scale);
    const top = large ? Math.round((height - 56 * scale) / 2) : 15;
    if (large) {
      const cx = left + 32;
      const cy = top + 32;
      picture.content.push('<g fill="none" stroke="' + accent + '" stroke-width="1">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="53" opacity=".24"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="65" opacity=".25" stroke-dasharray="2 5"/>' +
        '<path d="M' + (cx - 74) + ' ' + cy + 'h16m116 0h16m-74 -74v16m0 116v16" opacity=".25"/>' +
        '<circle class="animated" cx="' + (cx + 53) + '" cy="' + cy + '" r="3.8" fill="' + highlight + '" stroke="none">' +
        '<animateTransform attributeName="transform" type="rotate" from="0 ' + cx + ' ' + cy + '" to="360 ' + cx + ' ' + cy +
        '" dur="' + (period * 1.7).toFixed(2) + 's" repeatCount="indefinite"/></circle></g>');
    }
    picture.content.push(
      '<g transform="translate(' + left + ' ' + top + ') scale(' + scale + ')" fill="none" stroke="' + accent +
      '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path opacity="' +
      (large ? '.95' : '.78') + '" d="' + glyphs[item.icon] + '"/></g>'
    );
  }
  tagLines.forEach((text, i) => picture.line(text, x, 29 + i * 17, badge, { color:accent, weight:600, spacing:.06 }));
  titleLines.forEach((text, i) => picture.line(text, x, titleY + i * (titleSize + 3), titleSize, {
    color:'#faf7ff', weight:700, spacing:-.036,
  }));
  bodyLines.forEach((text, i) => picture.line(text, x, bodyY + i * lineHeight, bodySize));
  if (item.action) {
    const label = item.action + (item.link.startsWith('mailto:') ? '' : ' ↗');
    const buttonWidth = Math.ceil(label.length * badge * .55 + 30);
    const left = actionBelow ? x : width - x - buttonWidth;
    const top = actionBelow ? bottom + 13 : bottom - 21;
    picture.content.push('<rect x="' + left + '" y="' + top + '" width="' + buttonWidth +
      '" height="28" rx="7" fill="' + accent + '" fill-opacity=".12" stroke="' + accent + '" stroke-opacity=".42"/>');
    picture.line(label, left + buttonWidth / 2, top + 19, badge, { color:accent, weight:600, align:'middle' });
  }
  return picture.finish();
}

function sectionCard(section, width, theme) {
  const narrow = width === 420;
  const x = narrow ? 20 : 28;
  const size = narrow ? 37 : 53;
  const height = narrow ? 120 : 135;
  const { accent, highlight } = theme;
  const picture = scene(width, height, section.title + '. ' + section.signal, 9.8, theme, .35 + .43 * Number(section.index), 'divider');
  picture.content.push('<rect x="' + x + '" y="11" width="88" height="22" rx="5" fill="' + accent + '" fill-opacity=".15"/>');
  picture.line('SECTION ' + section.index, x + 9, 26, 11, { color:accent, weight:700, spacing:.085 });
  picture.line(section.title, x, narrow ? 75 : 84, size, { color:highlight, weight:700, spacing:-.049 });
  picture.line(section.signal, x, narrow ? 101 : 112, narrow ? 11 : 13, { color:'#bec6db', weight:600, spacing:.07 });
  return picture.finish();
}

function contactCard(contact, width, theme) {
  const picture = scene(width, 47, contact.title, 9.6, theme, .4 + contacts.indexOf(contact) * .53, 'link');
  picture.line(contact.title + '  ↗', width / 2, 31, 22, { color:theme.accent, weight:600, align:'middle' });
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
  const x = narrow ? 20 : 28;
  const height = narrow ? 206 : 219;
  const total = data.total.toLocaleString('en-US');
  const date = new Intl.DateTimeFormat('en-US', { year:'numeric', month:'short', day:'numeric', timeZone:'UTC' }).format(new Date(data.date + 'T00:00:00Z')).toUpperCase();
  const title = total + ' public contributions';
  const theme = themes.activity;
  const picture = scene(width, height, title + ' in the last year. Snapshot ' + date + '.', 9.4, theme, .92, 'activity');
  picture.line('04  /  GITHUB ACTIVITY', x, 29, narrow ? 12 : 14, { color:theme.accent, weight:600, spacing:.07 });
  picture.line(title, x, 72, narrow ? 32 : 45, { color:'#faf7ff', weight:700, spacing:-.039 });
  const base = height - 48;
  const slot = (width - 2 * x) / data.weeks.length;
  const maximum = Math.max(1, ...data.weeks);
  data.weeks.forEach((count, i) => {
    const bar = Math.max(2, Math.round(Math.sqrt(count / maximum) * 65));
    const left = (x + i * slot).toFixed(2);
    const barWidth = Math.max(2, slot - (narrow ? 1.4 : 3)).toFixed(2);
    const rect = '<rect x="' + left + '" y="' + (base - bar) + '" width="' + barWidth + '" height="' + bar + '" rx="1.4" fill="';
    picture.content.push(rect + (count ? theme.highlight : '#3a464a') + '"/>');
    if (count) picture.content.push(rect + 'url(#word-light)" class="animated"/>');
  });
  picture.line('WEEKLY ACTIVITY  /  SNAPSHOT ' + date, x, height - 19, narrow ? 11 : 14, { color:'#b8c9cb', weight:600, spacing:.06 });
  return picture.finish();
}

const path = id => cardFolder + id + '.svg';
const mobilePath = id => path(id + '-mobile');
function embed(id, alt, link) {
  const tag = '<picture><source media="(prefers-reduced-motion: reduce) and (max-width: 767px)" srcset="' + path(id + '-mobile-still') +
    '"><source media="(prefers-reduced-motion: reduce)" srcset="' + path(id + '-still') +
    '"><source media="(max-width: 767px)" srcset="' + mobilePath(id) +
    '"><img width="100%" src="' + path(id) + '" alt="' + escape(alt) + '"></picture>';
  return link ? '<a href="' + escape(link) + '">' + tag + '</a>' : tag;
}
const fullAlt = item => item.title + '. ' + item.tag + '. ' + item.body + (item.action ? ' ' + item.action + '.' : '');
const grid = await readContributionGrid();
await mkdir(directory, { recursive:true });
for (const width of [960, 420]) {
  let order = 0;
  const suffix = width === 420 ? '-mobile' : '';
  const save = async (id, svg) => {
    await writeFile(new URL(id + suffix + '.svg', directory), svg);
    const still = svg.replace(/<animate(?:Transform)?\b[^>]*\/>/g, '')
      .replace('@media(prefers-reduced-motion:reduce){.animated{display:none}}', '.animated{display:none}');
    await writeFile(new URL(id + suffix + '-still.svg', directory), still);
  };
  await save(intro.id, projectCard(intro, width, order++, themes.intro));
  for (const group of groups) {
    const theme = themes[group.id];
    await save(group.id, sectionCard(group, width, theme));
    for (const item of group.entries) await save(item.id, projectCard(item, width, order++, theme));
  }
  await save('activity', activityCard(grid, width));
}
const contactThemes = [themes.work, themes.research, themes.intro];
for (const [index, contact] of contacts.entries()) {
  const theme = contactThemes[index];
  await writeFile(new URL(contact.id + '.svg', directory), contactCard(contact, 300, theme));
  await writeFile(new URL(contact.id + '-mobile.svg', directory), contactCard(contact, 155, theme));
}

const cover = [
  '<a href="' + site + '/?build=1">',
  '  <picture>',
  '    <source media="(prefers-reduced-motion: reduce)" srcset="assets/portfolio-cover.png">',
  '    <img width="100%" src="assets/portfolio-build.gif" alt="Four agents build Vishvadharman Saminathan’s profile cover. AI, research and engineering.">',
  '  </picture>',
  '</a>',
].join('\n');
const terminal = [
  '<picture>',
  '  <source media="(prefers-reduced-motion: reduce) and (max-width: 767px)" srcset="assets/spectrum-console-mobile-still.png">',
  '  <source media="(prefers-reduced-motion: reduce)" srcset="assets/spectrum-console-still.png">',
  '  <source media="(max-width: 767px)" srcset="assets/spectrum-console-mobile.gif">',
  '  <img width="100%" src="assets/spectrum-console.gif" alt="Vishva Field Console demo: terminal commands run an ASCII document comparison for DeviationAI, a V2X simulation, and an encrypted BrainVault memory transfer.">',
  '</picture>',
].join('\n');
const buttons = contacts.map(contact => '<a href="' + contact.link + '"><picture><source media="(max-width: 767px)" srcset="' + mobilePath(contact.id) +
  '"><img width="31%" src="' + path(contact.id) + '" alt="' + contact.title + '"></picture></a>').join(' ');
const readme = [
  '<!-- Generated by scripts/build-profile.mjs. Edit the source to refresh the profile cards. -->',
  cover,
  terminal,
  '<p align="center">' + buttons + '</p>',
  embed(intro.id, fullAlt(intro), intro.link),
  ...groups.flatMap(group => [embed(group.id, group.title + '. ' + group.signal), ...group.entries.map(item => embed(item.id, fullAlt(item), item.link))]),
  embed('activity', 'GitHub activity. ' + grid.total + ' public contributions in the last year. Snapshot ' + grid.date + '.', contributionPage),
  '<img width="100%" src="' + snake + '" alt="Animated snake tracing Vishvadharman’s GitHub contributions">',
].join('\n\n') + '\n';
await writeFile(new URL('README.md', root), readme);
console.log('Generated the animated profile in ' + fileURLToPath(directory));
