window.promptsData = [];
let currentFullPrompt = "";

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

// Load Prompt JS Files Dynamically (p1.js to p50.js)
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
      <button class="copy-btn" id="btn-${id}" onclick="event.stopPropagation(); copyPromptText('btn-${id}', \`${encodeURIComponent(item.prompt || '')}\`)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        Copy Prompt
      </button>
    </div>
  `;
}

function renderGrid() {
  const grid = document.getElementById('explore-grid');
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  grid.innerHTML = '';
  const fragment = document.createDocumentFragment();

  window.promptsData.forEach((item, index) => {
    const match = (item.title?.toLowerCase().includes(query)) || (item.prompt?.toLowerCase().includes(query)) || (item.description?.toLowerCase().includes(query));
    if (match) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = createTakiesCard(item, `exp-${index}`, index);
      fragment.appendChild(tempDiv.firstElementChild);
    }
  });

  grid.appendChild(fragment);
}

// Open Full Detail Page
function openFullPage(index) {
  const item = window.promptsData[index];
  if (!item) return;

  currentFullPrompt = item.prompt || "";
  document.getElementById('page-explore').classList.remove('active-page');
  const mediaBox = document.getElementById('fullMediaBox');
  const baseRef = item.refId || `p${index + 1}ref`;

  mediaBox.style.display = 'flex';
  mediaBox.innerHTML = `<video src="${baseRef}.mp4" class="full-detail-media" controls autoplay loop playsinline onerror="handleMediaFallback(this, '${baseRef}', 1, true)"></video>`;

  document.getElementById('fullTitle').innerText = item.title || 'Untitled Prompt';
  document.getElementById('fullTag').innerText = item.description || item.category || 'AI PROMPT';
  document.getElementById('fullPromptText').innerText = currentFullPrompt;

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

// Copy Logic
function copyPromptText(btnId, encodedText) {
  const text = decodeURIComponent(encodedText);
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const origContent = btn.innerHTML;
    btn.innerHTML = `✓ Copied!`;
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = origContent;
      btn.classList.remove('copied');
    }, 2000);
  });
}

function copyFullPrompt() {
  navigator.clipboard.writeText(currentFullPrompt).then(() => {
    const btnMain = document.getElementById('fullCopyBtnMain');
    const btnHeader = document.getElementById('fullCopyBtnHeader');
    
    if (btnMain) {
      btnMain.innerHTML = `✓ Copied to Clipboard!`;
      btnMain.classList.add('copied');
    }
    if (btnHeader) {
      btnHeader.innerHTML = `✓ Copied!`;
      btnHeader.classList.add('copied');
    }

    setTimeout(() => {
      if (btnMain) {
        btnMain.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy Full Prompt`;
        btnMain.classList.remove('copied');
      }
      if (btnHeader) {
        btnHeader.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy`;
        btnHeader.classList.remove('copied');
      }
    }, 2000);
  });
}

// Initialize App
loadScripts();
