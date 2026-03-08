const API_URL = 'https://zvvvsurmgfnankspkibu.supabase.co/functions/v1/translate-darija';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2dnZzdXJtZ2ZuYW5rc3BraWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzY1ODQsImV4cCI6MjA3NjAxMjU4NH0.CmOHH7T5uVMgPI6dDsWZDvaCj1qrYz2tI_lndw';

const $ = (sel) => document.querySelector(sel);

const sourceLang = $('#sourceLang');
const targetLang = $('#targetLang');
const sourceText = $('#sourceText');
const charCount = $('#charCount');
const translateBtn = $('#translateBtn');
const swapBtn = $('#swapBtn');
const resultSection = $('#resultSection');
const translationResult = $('#translationResult');
const culturalNotes = $('#culturalNotes');
const detectedLang = $('#detectedLang');
const copyBtn = $('#copyBtn');
const loading = $('#loading');
const errorMsg = $('#errorMsg');

// Load saved preferences
chrome.storage.local.get(['sourceLang', 'targetLang'], (data) => {
  if (data.sourceLang) sourceLang.value = data.sourceLang;
  if (data.targetLang) targetLang.value = data.targetLang;
});

// Character count
sourceText.addEventListener('input', () => {
  charCount.textContent = `${sourceText.value.length}/1000`;
});

// Swap languages
swapBtn.addEventListener('click', () => {
  if (sourceLang.value === 'Detect Language') return;
  const temp = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = temp;
  savePrefs();
});

// Save language preferences
function savePrefs() {
  chrome.storage.local.set({
    sourceLang: sourceLang.value,
    targetLang: targetLang.value,
  });
}

sourceLang.addEventListener('change', savePrefs);
targetLang.addEventListener('change', savePrefs);

// Translate
translateBtn.addEventListener('click', translate);
sourceText.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) translate();
});

async function translate() {
  const text = sourceText.value.trim();
  if (!text) return;

  show(loading);
  hide(resultSection);
  hide(errorMsg);
  translateBtn.disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY,
      },
      body: JSON.stringify({
        text,
        sourceLanguage: sourceLang.value,
        targetLanguages: [targetLang.value],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error ${res.status}`);
    }

    const data = await res.json();
    const translation = data.translations?.[targetLang.value] || '';

    translationResult.textContent = translation || 'No translation available.';

    if (data.detectedLanguage) {
      detectedLang.textContent = `Detected: ${data.detectedLanguage}`;
      show(detectedLang);
    } else {
      hide(detectedLang);
    }

    if (data.culturalNotes) {
      culturalNotes.textContent = data.culturalNotes;
      show(culturalNotes);
    } else {
      hide(culturalNotes);
    }

    show(resultSection);
  } catch (err) {
    errorMsg.textContent = err.message || 'Translation failed. Please try again.';
    show(errorMsg);
  } finally {
    hide(loading);
    translateBtn.disabled = false;
  }
}

// Copy
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(translationResult.textContent).then(() => {
    copyBtn.textContent = '✅';
    setTimeout(() => (copyBtn.textContent = '📋'), 1500);
  });
});

// Listen for context menu selections from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'translateSelection') {
    sourceText.value = msg.text;
    charCount.textContent = `${msg.text.length}/1000`;
    translate();
  }
});

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }
