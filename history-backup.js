/* Local history transfer. No network requests or external dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MongilHistoryBackup = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const APP = 'mongil-history-backup';
  const VERSION = 1;
  const MAX_BYTES = 5 * 1024 * 1024;
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

  function validatePayload(text, index) {
    let data;
    try { data = JSON.parse(text); }
    catch (_) { throw new Error((index + 1) + '번째 기록의 편성 정보를 읽을 수 없습니다.'); }
    if (!object(data) || !Array.isArray(data.slots) || data.slots.length > 3 ||
        !data.slots.every(object) ||
        (data.detailedStats != null && !object(data.detailedStats))) {
      throw new Error((index + 1) + '번째 기록의 편성 형식이 올바르지 않습니다.');
    }
    return data;
  }

  function validateEntries(entries, maxEntries = 50) {
    if (!Array.isArray(entries) || entries.length > maxEntries) {
      throw new Error('기록은 최대 ' + maxEntries + '개까지 불러올 수 있습니다.');
    }
    const ids = new Set();
    return entries.map((entry, i) => {
      if (!object(entry) || typeof entry.id !== 'string' || !entry.id || entry.id.length > 200 ||
          ids.has(entry.id) || !Number.isSafeInteger(entry.savedAt) || entry.savedAt < 0 ||
          entry.savedAt > 8640000000000000 || typeof entry.payload !== 'string' ||
          entry.payload.length > MAX_BYTES) {
        throw new Error((i + 1) + '번째 기록의 형식이 올바르지 않습니다.');
      }
      ids.add(entry.id);
      const data = validatePayload(entry.payload, i);
      return {
        id: entry.id,
        savedAt: entry.savedAt,
        title: typeof entry.title === 'string' ? entry.title :
          (typeof data.partyTitle === 'string' ? data.partyTitle.trim() : ''),
        payload: entry.payload,
      };
    });
  }

  function encode(entries, maxEntries = 50) {
    const text = JSON.stringify({
      app: APP, version: VERSION, exportedAt: new Date().toISOString(),
      entries: validateEntries(entries, maxEntries),
    }, null, 2);
    if (new TextEncoder().encode(text).length > MAX_BYTES) {
      throw new Error('기록 파일이 5MB를 넘습니다. 일부 기록을 정리한 뒤 다시 시도해주세요.');
    }
    return text;
  }

  function decode(text, maxEntries = 50) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_BYTES) {
      throw new Error('5MB 이하의 기록 TXT 파일을 선택해주세요.');
    }
    let data;
    try { data = JSON.parse(text.replace(/^\uFEFF/, '')); }
    catch (_) { throw new Error('기록 TXT 파일을 읽을 수 없습니다. 내려받은 원본 파일을 선택해주세요.'); }
    if (!object(data) || data.app !== APP || data.version !== VERSION) {
      throw new Error('지원하는 몬길 에디터 기록 파일이 아닙니다.');
    }
    return validateEntries(data.entries, maxEntries);
  }

  function firstPayload(entries) {
    return entries.length ? entries[0].payload : JSON.stringify({
      app: 'mongil-stardive-party', schema: 1, slots: [], partyTitle: '',
      contentId: null, remarks: '', detailedStats: null,
    });
  }

  // localStorage.setItem is atomic. Restore the editor if rendering or writing fails.
  function replace(entries, env) {
    const previous = env.current();
    const next = firstPayload(entries);
    try {
      env.apply(next);
      env.storage.setItem(env.key, JSON.stringify(entries));
    } catch (error) {
      try { env.apply(previous); }
      catch (_) { throw new Error('기록을 바꾸지 못했습니다. 현재 화면을 다시 확인해주세요.'); }
      throw new Error('기록을 바꾸지 못했습니다. 저장 공간이나 브라우저 저장 설정을 확인해주세요.');
    }
    return next;
  }

  function bind(options) {
    const button = document.getElementById('btnUploadHistory');
    const input = document.getElementById('uploadHistoryInput');
    const download = document.getElementById('historyDownload');
    let importing = false;
    button.addEventListener('click', () => input.click());
    download.addEventListener('click', () => {
      let url;
      try {
        const text = encode(options.load(), options.max);
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const date = new Date();
        const pad = value => String(value).padStart(2, '0');
        const stamp = date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) +
          '_' + pad(date.getHours()) + pad(date.getMinutes()) + pad(date.getSeconds());
        url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = '몬길_기록_' + stamp + '.txt';
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
      } catch (error) { alert(error.message || '기록을 내려받지 못했습니다.'); }
      finally { if (url) setTimeout(() => URL.revokeObjectURL(url), 60000); }
    });
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file || importing) return;
      importing = true;
      button.disabled = true;
      try {
        if (file.size > MAX_BYTES) throw new Error('5MB 이하의 기록 TXT 파일을 선택해주세요.');
        const entries = decode(await file.text(), options.max);
        const message = '현재 기록을 덮어씌웁니다.\n\n' +
          '기존 ' + options.load().length + '개 → 업로드 ' + entries.length + '개\n' +
          (entries.length ? '가장 위 기록을 파티 및 상세 에디터에 적용합니다.' :
            '기록이 모두 삭제되고 현재 편성도 초기화됩니다.');
        if (!confirm(message)) return;
        const payload = replace(entries, {
          storage: localStorage, key: options.key, current: options.current, apply: options.apply,
        });
        // Reuse the existing editor handoff so detailed settings survive changing pages/reloading.
        try { sessionStorage.setItem('mongil-editor-handoff', payload); } catch (_) {}
        options.render();
        options.close();
        alert('기록 ' + entries.length + '개를 불러왔습니다.\n' +
          (entries.length ? '가장 위 기록의 편성을 적용했습니다.' : '현재 편성을 초기화했습니다.'));
      } catch (error) { alert(error.message || '기록을 불러오지 못했습니다.'); }
      finally { importing = false; button.disabled = false; }
    });
  }

  return Object.freeze({ encode, decode, validateEntries, firstPayload, replace, bind, MAX_BYTES });
});
