let videoElement = document.getElementById('preview');
let canvasElement = document.createElement('canvas');
let canvasContext = canvasElement.getContext('2d');
let videoStream = null;
let currentStream = null;
let videoDevices = [];

// Cihazları kontrol et
async function getCameraDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    videoDevices = devices.filter(device => device.kind === 'videoinput');
    populateCameraSelect(); // Kameraları listede göster
    return videoDevices;
  } catch (err) {
    console.error("Kameralar listelenirken hata oluştu: ", err);
  }
}

// Kameralar için seçim listesini doldur
function populateCameraSelect() {
  const cameraSelect = document.getElementById('cameraSelect');
  videoDevices.forEach((device, index) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.textContent = device.label || `Kamera ${index + 1}`;
    cameraSelect.appendChild(option);
  });
}

// Kamerayı başlat
async function startCamera(deviceId) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: deviceId }
    });

    // Eğer önceki kamera akışı varsa durdur
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    // Yeni akışı başlat
    videoElement.srcObject = stream;
    currentStream = stream;
  } catch (err) {
    console.error("Kamera başlatılırken hata oluştu: ", err);
  }
}

// Kamera değişim fonksiyonu
async function switchCamera(event) {
  const deviceId = event.target.value;
  if (deviceId) {
    await startCamera(deviceId);
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
getCameraDevices().then(() => {
  // Varsayılan olarak ilk kamerayı başlat
  if (videoDevices.length > 0) {
    startCamera(videoDevices[0].deviceId);
  }
});

setInterval(scanQRCode, 300); // QR kodunu her 300ms'de bir kontrol et
