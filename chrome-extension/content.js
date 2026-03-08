(() => {
  const API_URL = 'https://zvvvsurmgfnankspkibu.supabase.co/functions/v1/translate-darija';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2dnZzdXJtZ2ZuYW5rc3BraWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzY1ODQsImV4cCI6MjA3NjAxMjU4NH0.CmOHH7T5uVMgPI6dDsWZDvaCj1qrYz2tI_lndw';

  let floatingBtn = null;
  let resultPanel = null;

  // Create floating translate button
  function createFloatingBtn(x, y) {
    removeFloatingBtn();
    floatingBtn = document.createElement('button');
    floatingBtn.id = 'tarjama-float-btn';
    floatingBtn.innerHTML = '🌍 Translate';
    floatingBtn.style.left = `${x}px`;
    floatingBtn.style.top = `${y - 40}px`;
    document.body.appendChild(floatingBtn);

    floatingBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sel = window.getSelection().toString().trim();
      if (sel) translateAndShow(sel, x, y);
    });
  }

  function removeFloatingBtn() {
    if (floatingBtn) {
      floatingBtn.remove();
      floatingBtn = null;
    }
  }

  function removeResultPanel() {
    if (resultPanel) {
      resultPanel.remove();
      resultPanel = null;
    }
  }

  // Show result panel
  function showResultPanel(x, y, content, isLoading = false) {
    removeResultPanel();
    resultPanel = document.createElement('div');
    resultPanel.id = 'tarjama-result-panel';

    const viewportW = window.innerWidth;
    const panelW = 320;
    let left = x;
    if (left + panelW > viewportW - 16) left = viewportW - panelW - 16;
    if (left < 16) left = 16;

    resultPanel.style.left = `${left}px`;
    resultPanel.style.top = `${y + 10}px`;

    if (isLoading) {
      resultPanel.innerHTML = `
        <div class="tarjama-panel-header">
          <span class="tarjama-panel-logo">🌍 TARJAMA</span>
        </div>
        <div class="tarjama-panel-loading">
          <div class="tarjama-spinner"></div>
          <span>Translating...</span>
        </div>
      `;
    } else {
      resultPanel.innerHTML = `
        <div class="tarjama-panel-header">
          <span class="tarjama-panel-logo">🌍 TARJAMA</span>
          <button class="tarjama-panel-close" title="Close">✕</button>
        </div>
        <div class="tarjama-panel-body">${content}</div>
      `;
      resultPanel.querySelector('.tarjama-panel-close')?.addEventListener('click', removeResultPanel);
    }

    document.body.appendChild(resultPanel);
  }

  async function translateAndShow(text, x, y) {
    removeFloatingBtn();
    showResultPanel(x, y, '', true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
          'apikey': ANON_KEY,
        },
        body: JSON.stringify({
          text: text.substring(0, 1000),
          sourceLanguage: 'Detect Language',
          targetLanguages: ['Darija', 'English', 'French'],
        }),
      });

      if (!res.ok) throw new Error('Translation failed');

      const data = await res.json();
      const translations = data.translations || {};

      let html = '';
      if (data.detectedLanguage) {
        html += `<div class="tarjama-detected">Detected: ${data.detectedLanguage}</div>`;
      }
      for (const [lang, text] of Object.entries(translations)) {
        html += `<div class="tarjama-translation-item"><strong>${lang}:</strong> ${text}</div>`;
      }
      if (data.culturalNotes) {
        html += `<div class="tarjama-cultural">💡 ${data.culturalNotes}</div>`;
      }
      if (!html) html = '<div class="tarjama-translation-item">No translation available.</div>';

      showResultPanel(x, y, html);
    } catch (err) {
      showResultPanel(x, y, `<div class="tarjama-error">${err.message}</div>`);
    }
  }

  // Listen for text selection
  document.addEventListener('mouseup', (e) => {
    // Ignore clicks on our own elements
    if (e.target.closest('#tarjama-float-btn, #tarjama-result-panel')) return;

    setTimeout(() => {
      const sel = window.getSelection().toString().trim();
      if (sel && sel.length > 1 && sel.length <= 1000) {
        const range = window.getSelection().getRangeAt(0);
        const rect = range.getBoundingClientRect();
        createFloatingBtn(
          rect.left + window.scrollX + rect.width / 2 - 50,
          rect.top + window.scrollY
        );
      } else {
        removeFloatingBtn();
      }
    }, 10);
  });

  // Remove on click elsewhere
  document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('#tarjama-float-btn, #tarjama-result-panel')) {
      removeFloatingBtn();
      removeResultPanel();
    }
  });

  // Listen for context menu translate from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'translateInline' && msg.text) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        translateAndShow(msg.text, rect.left + window.scrollX, rect.bottom + window.scrollY);
      } else {
        // Fallback: center of viewport
        translateAndShow(msg.text, window.innerWidth / 2 - 160, window.innerHeight / 3 + window.scrollY);
      }
    }
  });
})();
