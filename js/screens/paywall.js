// دالة عالمية (Global) تعمل مباشرة عند الضغط على الزر
function unlockApp() {
  const input = document.getElementById('keyInput');
  const key = input.value.trim().toUpperCase();
  const validKeys = ['DEGIROB-2026', 'VIP-ALPHA-001'];

  if (validKeys.includes(key)) {
    // حفظ المفتاح
    localStorage.setItem('degirob_license', key);
    
    // إخفاء الشاشة وإظهار التطبيق
    document.getElementById('paywall').style.display = 'none'; // إخفاء قسري
    document.getElementById('bottomNav').style.display = 'flex';
    
    // الانتقال للرئيسية
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('dashboard').classList.add('active');
    
    // تشغيل العرض
    if (window.App && typeof App.enterApp === 'function') {
        App.enterApp(); 
    } else {
        // في حال لم يتم تحميل app.js بشكل صحيح، نقوم بالعرض يدوياً
        if (window.Dashboard) Dashboard.render();
    }
  } else {
    alert('❌ Invalid License Key. Try: DEGIROB-2026');
  }
}

const Paywall = {
  init: () => {
    // لا نحتاج لربط الأزرار هنا لأننا فعلناها بـ onclick في HTML
  }
};
