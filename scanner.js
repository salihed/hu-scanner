// DOM elementlerini en başta tanımla
const statusElement = document.getElementById('status');
const lastScannedElement = document.getElementById('lastScanned');

// Element kontrol fonksiyonu
function checkDOMElements() {
  if (!statusElement || !lastScannedElement) {
    console.error("HATA: HTML elementleri bulunamadı!");
    console.log("Aranan elementler:", {
      status: document.getElementById('status'),
      lastScanned: document.getElementById('lastScanned')
    });
    throw new Error("Gerekli HTML elementleri eksik");
  }
}

// Tarama sonucu işleme (GÜNCELLENMİŞ)
function processScannedCode(code) {
  try {
    checkDOMElements(); // Elementleri kontrol et
    
    console.log("Taranan Kod:", code);
    lastScannedElement.textContent = `📦 Taranan TB: ${code}`;
    lastScannedElement.style.color = "#333";

    if (tbList.includes(code)) {
      statusElement.innerHTML = `✅ <b>Geçerli TB:</b> ${code}`;
      statusElement.className = "valid";
    } else {
      statusElement.innerHTML = `❌ <b>Geçersiz TB:</b> ${code}`;
      statusElement.className = "invalid";
    }

    // 2 saniye sonra tarama moduna dön
    setTimeout(() => {
      statusElement.textContent = "🔍 Yeni QR kodu bekleniyor...";
      statusElement.className = "scanning";
    }, 2000);

  } catch (error) {
    console.error("İşleme hatası:", error);
  }
}

// Sayfa yüklendiğinde kontrol et
document.addEventListener('DOMContentLoaded', () => {
  checkDOMElements();
  console.log("DOM elementleri doğrulandı:", {
    status: statusElement,
    lastScanned: lastScannedElement
  });
});