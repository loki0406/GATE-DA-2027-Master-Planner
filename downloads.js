(() => {
  const names = [
    'Probability & Statistics', 'Linear Algebra', 'Calculus & Optimization',
    'Programming, Data Structures & Algorithms',
    'Database Management & Warehousing', 'Machine Learning', 'Artificial Intelligence'
  ];
  const buttons = document.getElementById('zipSectionButtons');
  const content = document.getElementById('zipSectionContent');
  if (!buttons || !content) return;
  let selected = 1;
  let checking = false;
  const status = names.map(() => ({ ppt: 'checking', pdf: 'checking' }));
  const pathFor = (number, type) => `./${type === 'ppt' ? 'ppts' : 'pdfs'}/section-${number}.zip`;

  function render() {
    buttons.querySelectorAll('button').forEach(button => {
      const active = Number(button.dataset.section) === selected;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    content.replaceChildren();
    const title = document.createElement('h3');
    title.className = 'zip-section-heading';
    title.textContent = `Section ${selected} · ${names[selected - 1]}`;
    content.appendChild(title);
    const grid = document.createElement('div');
    grid.className = 'zip-material-grid';
    for (const type of ['ppt', 'pdf']) {
      const state = status[selected - 1][type];
      const label = type.toUpperCase();
      const card = document.createElement('article');
      card.className = 'card zip-material-card';
      const eyebrow = document.createElement('span');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = type === 'ppt' ? 'PRESENTATIONS' : 'READING MATERIAL';
      const heading = document.createElement('h3');
      heading.textContent = `${label} ZIP collection`;
      const description = document.createElement('p');
      description.textContent = type === 'pdf' ? 'Section-wise PDF study materials.' : selected === 1 ? '40 topic-wise presentations · 969 slides.' : 'Topic-wise PowerPoint presentations.';
      const badge = document.createElement('span');
      badge.className = `zip-status${state === 'ready' ? ' is-ready' : ''}`;
      badge.textContent = { ready: 'Available', missing: 'Coming soon', checking: 'Checking availability…', error: 'Unable to check — refresh to retry' }[state];
      const action = document.createElement(state === 'ready' ? 'a' : 'button');
      action.className = 'zip-download';
      if (state === 'ready') {
        action.href = pathFor(selected, type);
        action.download = `GATE_DA_Section_${selected}_${label}s.zip`;
        action.textContent = `↓ Download ${label} ZIP`;
        action.setAttribute('aria-label', `Download Section ${selected} ${label} ZIP`);
      } else {
        action.type = 'button';
        action.disabled = true;
        action.textContent = state === 'missing' ? `${label} ZIP coming soon` : state === 'checking' ? 'Checking…' : 'Temporarily unavailable';
      }
      card.append(eyebrow, heading, description, badge, action);
      grid.appendChild(card);
    }
    content.appendChild(grid);
  }

  async function checkFile(number, type) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(pathFor(number, type), { method: 'HEAD', cache: 'no-store', signal: controller.signal });
      const mime = (response.headers.get('content-type') || '').toLowerCase();
      if (response.status === 404 || response.status === 410) return 'missing';
      if (!response.ok) return 'error';
      // A hosting fallback may return an HTML page with a 200 status.
      if (mime.includes('text/html')) return 'missing';
      if (response.headers.get('content-length') === '0') return 'error';
      return mime.includes('zip') || mime.includes('octet-stream') ? 'ready' : 'error';
    } catch { return 'error'; }
    finally { clearTimeout(timeout); }
  }

  async function checkAll() {
    if (checking) return;
    checking = true;
    await Promise.all(names.flatMap((_, index) => ['ppt', 'pdf'].map(async type => {
      status[index][type] = await checkFile(index + 1, type);
    })));
    checking = false;
    render();
  }

  names.forEach((name, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'zip-section-button';
    button.dataset.section = index + 1;
    button.textContent = `${index + 1}. ${name}`;
    button.addEventListener('click', () => { selected = index + 1; render(); });
    buttons.appendChild(button);
  });
  render();
  checkAll();
  window.addEventListener('focus', checkAll);
})();
