showError() {
  const e = STATE.apiError || { code: 'UNKNOWN', message: 'خطأ غير معروف', detail: '' };
  const friendly = {
    'NO_API_KEY': 'لم يتم إعداد مفتاح API',
    'KEY_INVALID': 'المفتاح غير صالح',
    'NETWORK_ERROR': 'تعذر الاتصال بالإنترنت أو بخادم API', // 👈 تمت الإضافة
    'NO_MATCHES': '0 مباريات اليوم — جرّب لاحقاً',
    'NORMALIZE_FAILED': 'تعذّر تحويل البيانات',
    'API_ERROR': 'خطأ من API-Football',
    'UNKNOWN': 'خطأ غير معروف'
  };
  const html = `
    <div class="empty-state" style="padding:40px 20px">
      <div style="font-size:40px;margin-bottom:16px">⚠️</div>
      <div class="empty-state-title" style="margin-bottom:10px;font-size:15px">
        ${friendly[e.code] || e.message}
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-bottom:6px;font-family:ui-monospace,monospace">${e.code}</div>
      <div style="font-size:10px;color:var(--text-3);margin-bottom:24px;font-family:ui-monospace,monospace;word-break:break-all;max-width:340px;margin:0 auto">${(e.detail || e.message || '').substring(0, 200)}</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="retry-btn" onclick="App.loadMatches()">🔄 إعادة المحاولة</button>
        <button class="retry-btn" style="background:linear-gradient(135deg,#F43F5E,#DC2626)" onclick="API.clearCache();location.reload()">🗑️ مسح cache</button>
        <button class="retry-btn" style="background:linear-gradient(135deg,#6B7280,#4B5563)" onclick="if(window.eruda)eruda.show()">🔍 Console</button>
      </div>
    </div>`;
  const g = document.getElementById('goldenPicks');
  const m = document.getElementById('morePicks');
  if (g) g.innerHTML = html;
  if (m) m.innerHTML = '';
},
