// Scanner.js - Güncel Sürüm (Tüm İyileştirmelerle)

// Dosyanın en başına ekleyin
if (typeof jsQR === 'undefined') {
    document.getElementById('status').innerHTML = `
      <div style="color: red; padding: 10px; border: 1px solid red;">
        ❌ jsQR.js dosyası yüklenmedi!<br>
        Lütfen:<br>
        1. js/jsQR.js dosyasının varlığını kontrol edin<br>
        2. Tarayıcı önbelleğini temizleyin (Ctrl+F5)
      </div>
    `;
    throw new Error("jsQR kütüphanesi eksik");
  }


// DOM Elementleri
const videoElement = document.getElementById('preview');
const statusElement = document.getElementById('status');
const lastScannedElement = document.getElementById('lastScanned');
const canvasElement = document.createElement('canvas');
const canvasContext = canvasElement.getContext('2d');

// Tarama Durum Değişkenleri
let videoStream = null;
let lastScannedCode = null;
let scanningActive = true;
let scanAttempts = 0;
const MAX_SCAN_ATTEMPTS = 10;

// TB Listesi Kontrolü
if (typeof tbList === 'undefined') {
  console.error("HATA: tb-list.js yüklenmedi!");
  statusElement.textContent = "❌ Hata: TB listesi yüklenemedi!";
  scanningActive = false;
} else {
  console.log("TB Listesi yüklendi. Toplam TB:", tbList.length);
}

// Kamera Başlatma
async function initCamera() {
  try {
    // Kamera cihazlarını listele
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    if (videoDevices.length === 0) {
      throw new Error("Kamera cihazı bulunamadı");
    }

    // Arka kamerayı bul (mobil cihazlar için)
    let selectedCamera = videoDevices.find(device => 
      device.label.toLowerCase().includes("back") || 
      (device.getCapabilities && device.getCapabilities().facingMode === "environment")
    ) || videoDevices[0]; // Bulunamazsa ilk kamerayı seç

    // Kamera ayarları
    const constraints = {
      video: {
        deviceId: selectedCamera.deviceId,
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    // Kamerayı başlat
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoStream = stream;
    videoElement.srcObject = stream;
    
    // Kamera hazır olduğunda taramayı başlat
    videoElement.onplaying = () => {
      statusElement.textContent = "🔍 QR kodu bekleniyor...";
      statusElement.style.color = "blue";
      requestAnimationFrame(scanLoop);
    };

  } catch (error) {
    console.error("Kamera hatası:", error);
    statusElement.innerHTML = `❌ Kamera hatası: <small>${error.message}</small>`;
    statusElement.style.color = "red";
    scanningActive = false;
  }
}

// QR Tarama Fonksiyonu
function scanQRCode() {
  if (!scanningActive || !videoElement.videoWidth) {
    scanAttempts++;
    if (scanAttempts > MAX_SCAN_ATTEMPTS) {
      statusElement.textContent = "⚠️ Kamera başlatılamadı. Sayfayı yenileyin.";
      scanningActive = false;
    }
    return null;
  }

  // Canvas'a video karesini çiz
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  // QR kodunu çöz
  const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const code = jsQR(imageData.data, canvasElement.width, canvasElement.height, {
    inversionAttempts: "dontInvert",
    canOverwriteImage: false
  });

  return code ? code.data : null;
}

// Tarama Sonuç İşleme
function processScannedCode(code) {
  console.log("Taranan Kod:", code);
  lastScannedElement.textContent = `📦 Taranan TB: ${code}`;
  lastScannedElement.style.color = "#333";

  if (tbList.includes(code)) {
    statusElement.innerHTML = `✅ <b>Geçerli TB:</b> ${code}`;
    statusElement.style.color = "green";
    statusElement.style.fontWeight = "bold";
  } else {
    statusElement.innerHTML = `❌ <b>Geçersiz TB:</b> ${code}`;
    statusElement.style.color = "red";
    statusElement.style.fontWeight = "bold";
  }

  // 2 saniye sonra tarama durumunu sıfırla
  setTimeout(() => {
    lastScannedCode = null;
    statusElement.textContent = "🔍 Yeni QR kodu bekleniyor...";
    statusElement.style.color = "blue";
    statusElement.style.fontWeight = "normal";
  }, 2000);
}

// Tarama Döngüsü
function scanLoop() {
  if (!scanningActive) return;

  const scannedCode = scanQRCode();
  if (scannedCode && scannedCode !== lastScannedCode) {
    lastScannedCode = scannedCode;
    processScannedCode(scannedCode);
  }

  requestAnimationFrame(scanLoop);
}

// Hata Yönetimi
videoElement.addEventListener('error', (e) => {
  console.error("Video Hatası:", e);
  statusElement.textContent = "❌ Video akışında hata!";
});

// Sayfa yüklendiğinde kamerayı başlat
document.addEventListener('DOMContentLoaded', () => {
  console.log("Scanner başlatılıyor...");
  initCamera();
});

// Temizlik (sayfa kapatılırken)
window.addEventListener('beforeunload', () => {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
  }
});