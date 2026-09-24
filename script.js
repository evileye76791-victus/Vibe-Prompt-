window.promptsData = [];

// Media Fallback System (.mp4 -> .jpg -> .png -> hide)
function handleMediaFallback(el, baseRef, step = 1, isFullView = false) {
  const container = isFullView ? document.getElementById('fullMediaBox') : el.parentElement;
  if (step === 1) {
    container.innerHTML = `<img src="${baseRef}.jpg" class="${isFullView ? 'full-detail-media' : 'media-preview'}" loading="lazy" onerror="handleMediaFallback(this, '${baseRef}', 2, ${isFullView})">`;
  } else if (step === 2) {
    container.innerHTML = `<img src="${baseRef}.png" class="${isFullView ? 'full-detail-media' : 'media-preview'}" loading="lazy" onerror="handleMediaFallback(this, '${baseRef}', 3, ${isFullView})">`;
  } else {
    container.style.display = 'none';
    container.innerHTML = '';
  }
}

// Load Prompt JS Files Dynamically (p1.js, p2.js, etc.)
async function loadScripts() {
  const loadScript = (i) => new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = `p${i}.js`;
    s.onload = s.onerror = () => resolve();
    document.body.appendChild(s);
  });

  for (let i = 1; i <= 50; i++) {
    await loadScript(i);
    renderGrid();
  }
}

// Render Main Grid
function createTakiesCard(item, id, index) {
  const baseRef = item.refId || `p${index + 1}ref`;
  return `
    <div class="takies-card" onclick="openFullPage(${index})">
      <div class="media-box">
        <video src="${baseRef}.mp4" class="media-preview" muted loop playsinline preload="metadata" onloadeddata="this.currentTime = 0.1;" onerror="handleMediaFallback(this, '${baseRef}', 1, false)"></video>
      </div>
      <div class="card-head">
        <span class="card-title">${item.title || 'Untitled Prompt'}</span>
        <span class="tag">${item.description || item.category || 'AI'}</span>
      </div>
      <div class="prompt-content">${item.prompt || ''}</div>
      <button class="copy-btn" id="btn-${id}" onclick="event.stopPropagation(); copyPrompt('btn-${id}', '${encodeURIComponent(item.prompt || '')}')">Copy Prompt</button>
    </div>
  `;
}

function renderGrid() {
  const grid = document.getElementById('explore-grid');
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  grid.innerHTML = '';
  const fragment = document.createDocumentFragment();

  window.promptsData.forEach((item, index) => {
    const match = (item.title?.toLowerCase().includes(query)) || (item.prompt?.toLowerCase().includes(query));
    if (match) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = createTakiesCard(item, `exp-${index}`, index);
      fragment.appendChild(tempDiv.firstElementChild);
    }
  });

  grid.appendChild(fragment);
}

// Detail View Controls
function openFullPage(index) {
  const item = window.promptsData[index];
  if (!item) return;

  document.getElementById('page-explore').classList.remove('active-page');
  const mediaBox = document.getElementById('fullMediaBox');
  const baseRef = item.refId || `p${index + 1}ref`;

  mediaBox.style.display = 'flex';
  mediaBox.innerHTML = `<video src="${baseRef}.mp4" class="full-detail-media" controls autoplay loop playsinline onerror="handleMediaFallback(this, '${baseRef}', 1, true)"></video>`;

  document.getElementById('fullTitle').innerText = item.title || 'Untitled Prompt';
  document.getElementById('fullTag').innerText = item.description || item.category || 'AI';
  document.getElementById('fullPromptText').innerText = item.prompt || '';

  const copyBtn = document.getElementById('fullCopyBtn');
  copyBtn.onclick = () => copyPrompt('fullCopyBtn', encodeURIComponent(item.prompt || ''));

  document.getElementById('full-detail-page').style.display = 'flex';
  window.scrollTo(0, 0);
}

function closeFullPage() {
  const mediaBox = document.getElementById('fullMediaBox');
  mediaBox.innerHTML = '';
  mediaBox.style.display = 'none';
  document.getElementById('full-detail-page').style.display = 'none';
  document.getElementById('page-explore').classList.add('active-page');
}

// Copy Action Function
function copyPrompt(btnId, encodedText) {
  const text = decodeURIComponent(encodedText);
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const origText = btn.innerText;
    btn.innerText = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerText = origText;
      btn.classList.remove('copied');
    }, 2000);
  });
}

// Initialize Application
loadScripts();
