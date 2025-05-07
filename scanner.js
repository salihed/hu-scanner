let videoElement = document.getElementById('preview');
let canvasElement = document.createElement('canvas');
let canvasContext = canvasElement.getContext('2d');
let videoStream = null;
let lastScannedCode = null;
let scanningActive = true;

// TB listesi kontrolü
if (typeof tbList === 'undefined') {
  console.error("tb-list.js yüklenmedi!");
  document.getElementById('status').textContent = "Hata: TB listesi yüklenemedi!";
  scanningActive = false;
}

// Cihazları kontrol et
async function getCameraDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    return videoDevices;
  } catch (err) {
    console.error("Kameralar listelenirken hata oluştu: ", err);
    document.getElementById('status').textContent = "Kamera erişiminde hata!";
    scanningActive = false;
    return [];
  }
}

// Kamerayı başlat
async function startCamera() {
  try {
    const videoDevices = await getCameraDevices();
    if (videoDevices.length === 0) {
      throw new Error("Kamera bulunamadı");
    }

    // Arka kamerayı bulmaya çalış
    let backCamera = videoDevices.find(device => 
      device.label.toLowerCase().includes("back") || 
      (device.getCapabilities && device.getCapabilities().facingMode === "environment")
    );

    // Arka kamera yoksa ilk kamerayı kullan
    if (!backCamera) {
      backCamera = videoDevices[0];
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        deviceId: backCamera.deviceId,
        facingMode: "environment" // Mobil cihazlarda arka kamerayı zorla
      }
    });

    videoElement.srcObject = stream;
    videoStream = stream;
    document.getElementById('status').textContent = "Kamera başarıyla başlatıldı. Taramaya hazır!";
    
    // Taramayı başlat
    scanLoop();
  } catch (err) {
    console.error("Kamera başlatılırken hata oluştu: ", err);
    document.getElementById('status').textContent = "Kamera başlatılamadı. Lütfen izinleri kontrol edin.";
    scanningActive = false;
  }
}

// QR kodu çözümleme fonksiyonu
function scanQRCode() {
  if (!scanningActive || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
    return null;
  }

  canvasElement.height = videoElement.videoHeight;
  canvasElement.width = videoElement.videoWidth;
  canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const code = jsQR(imageData.data, canvasElement.width, canvasElement.height);

  if (code && code.data !== lastScannedCode) {
    lastScannedCode = code.data;
    return code.data;
  }
  return null;
}

// Tarama döngüsü
function scanLoop() {
  if (!scanningActive) return;
  
  const scannedCode = scanQRCode();
  if (scannedCode) {
    processScannedCode(scannedCode);
  }
  
  requestAnimationFrame(scanLoop);
}

// Tarama sonucunu işle
function processScannedCode(code) {
  console.log(`Taranan QR: ${code}`);
  document.getElementById('lastScanned').textContent = `📦 Taranan TB: ${code}`;

  if (tbList.includes(code)) {
    document.getElementById('status').textContent = `✅ Geçerli TB: ${code}`;
    document.getElementById('status').style.color = "green";
    document.getElementById('status').style.fontWeight = "bold";
  } else {
    document.getElementById('status').textContent = `❌ Geçersiz TB: ${code}`;
    document.getElementById('status').style.color = "red";
    document.getElementById('status').style.fontWeight = "bold";
  }
}

// Uygulamayı başlat
startCamera();