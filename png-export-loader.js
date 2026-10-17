/* Load the local PNG renderer only when saving. Failed loads can be retried. */
(function () {
  'use strict';
  const url = new URL('vendor/html2canvas.min.js', document.currentScript.src).href;
  let pending;
  window.MongilPngRenderer = Object.freeze({
    load() {
      if (typeof window.html2canvas === 'function') return Promise.resolve(window.html2canvas);
      if (pending) return pending;
      pending = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        let timer;
        const fail = () => {
          clearTimeout(timer);
          script.onload = script.onerror = null;
          script.remove();
          pending = null;
          reject(new Error('PNG 저장 도구를 불러오지 못했습니다. 연결을 확인하고 다시 눌러주세요.'));
        };
        script.src = url;
        script.async = true;
        script.onload = () => {
          if (typeof window.html2canvas !== 'function') return fail();
          clearTimeout(timer);
          script.onload = script.onerror = null;
          resolve(window.html2canvas);
        };
        script.onerror = fail;
        timer = setTimeout(fail, 30000);
        document.head.appendChild(script);
      });
      return pending;
    },
  });
})();
