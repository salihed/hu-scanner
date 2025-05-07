let videoElement = document.getElementById('preview');
let canvasElement = document.createElement('canvas');
let canvasContext = canvasElement.getContext('2d');
let videoStream = null;

// Cihazları kontrol et
async function getCameraDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    return videoDevices;
  } catch (err) {
    console.error("Kameralar listelenirken hata oluştu: ", err);
  }
}

// Kamerayı başlat
async function startCamera() {
  try {
    const videoDevices = await getCameraDevices();

    // Arka kamerayı bulmaya çalış
    let backCamera = videoDevices.find(device => device.label.toLowerCase().includes("back") || device.facingMode === "environment");

    if (!backCamera) {
      console.error("Arka kamera bulunamadı.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: backCamera.deviceId }
    });

    // Videoyu başlat
    videoElement.srcObject = stream;
    videoStream = stream;
  } catch (err) {
    console.error("Kamera başlatılırken hata oluştu: ", err);
  }
}

// QR kodu çözümleme fonksiyonu
function scanQRCode() {
  if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
    return; // Kamera görüntüsü yoksa işlemi durdur
  }

  // Canvas'a video verisini çiz
  canvasElement.height = videoElement.videoHeight;
  canvasElement.width = videoElement.videoWidth;
  canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  // QR kodunu çöz
  const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const code = jsQR(imageData.data, canvasElement.width, canvasElement.height);

  if (code) {
    // QR kodu okunduğunda ekrana yazdır
    console.log(`Taranan QR: ${code.data}`);
    document.getElementById('status').textContent = `📦 Taranan TB: ${code.data}`;

    // Burada TB'yi kontrol edip eşleştirme yapılabilir
    if (tbList.includes(code.data)) {
      document.getElementById('status').textContent = `✅ Geçerli TB: ${code.data}`;
      document.getElementById('status').style.color = "green"; // Geçerli olduğunda yeşil
    } else {
      document.getElementById('status').textContent = `❌ Geçersiz TB: ${code.data}`;
      document.getElementById('status').style.color = "red"; // Geçersiz olduğunda kırmızı
    }
  } else {
    document.getElementById('status').textContent = "QR kodu bulunamadı.";
  }
}

// Kamerayı başlat ve taramayı başlat
startCamera();
setInterval(scanQRCode, 300); // QR kodunu her 300ms'de bir kontrol et
