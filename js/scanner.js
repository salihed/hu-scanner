// DOM elementlerini en başta tanımla
const statusElement = document.getElementById('status');
const lastScannedElement = document.getElementById('lastScanned');
const historyList = document.getElementById('historyList');

// Ses dosyalarını yükle
const validSound = new Audio('sounds/gecerli-bip.mp3');
const invalidSound = new Audio('sounds/gecersiz-uyari.mp3');

// Element kontrol fonksiyonu
function checkDOMElements() {
  if (!statusElement || !lastScannedElement || !historyList) {
    console.error("HATA: HTML elementleri bulunamadı!");
    console.log("Aranan elementler:", {
      status: document.getElementById('status'),
      lastScanned: document.getElementById('lastScanned'),
      historyList: document.getElementById('historyList')
    });
    throw new Error("Gerekli HTML elementleri eksik");
  }
}

// Tarama sonucu işleme
function processScannedCode(code) {
  try {
    checkDOMElements(); // Elementleri kontrol et

    console.log("Taranan Kod:", code);
    lastScannedElement.textContent = `📦 Taranan TB: ${code}`;
    lastScannedElement.style.color = "#333";

    // Geçerli TB
    if (tbSet.has(code)) {
      statusElement.innerHTML = `✅ <b>Geçerli TB:</b> ${code}`;
      statusElement.className = "valid";
      validSound.play(); // Geçerli ses çal
    } 
    // Geçersiz TB
    else {
      statusElement.innerHTML = `❌ <b>Geçersiz TB:</b> ${code}`;
      statusElement.className = "invalid";
      invalidSound.play(); // Geçersiz ses çal
    }

    // Geçmişe ekle
    const listItem = document.createElement('li');
    listItem.textContent = code;
    listItem.className = tbSet.has(code) ? 'valid' : 'invalid';
    historyList.prepend(listItem); // Üste ekle

    // Maksimum 50 kayıt tut
    if (historyList.children.length > 50) {
      historyList.removeChild(historyList.lastChild);
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

// Kamera başlatma ve QR tarama döngüsü
const video = document.getElementById('preview');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let lastScanned = null;
let scanCooldown = false;

// Kamera başlatma
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then((stream) => {
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // iOS uyumu
    requestAnimationFrame(scanLoop);
  })
  .catch((err) => {
    console.error("Kamera başlatılamadı:", err);
    statusElement.textContent = "🚫 Kamera başlatılamadı!";
    statusElement.className = "invalid";
  });

// QR tarama döngüsü
function scanLoop() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

    if (qrCode && !scanCooldown) {
      const code = qrCode.data.trim();
      if (code !== lastScanned) {
        lastScanned = code;
        scanCooldown = true;
        processScannedCode(code);

        // Cooldown süresi: 2 saniye
        setTimeout(() => {
          scanCooldown = false;
        }, 2000);
      }
    }
  }
  requestAnimationFrame(scanLoop);
}

// Sayfa yüklendiğinde kontrol et
document.addEventListener('DOMContentLoaded', () => {
  checkDOMElements();
  console.log("DOM elementleri doğrulandı:", {
    status: statusElement,
    lastScanned: lastScannedElement,
    historyList: historyList
  });
});
