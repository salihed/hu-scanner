// Kamera cihazlarını almak ve arka kamerayı kullanmak
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    let videoDeviceId = null;

    // Cihazlar arasında gezerek, video (kamera) cihazlarını buluyoruz
    devices.forEach(device => {
      if (device.kind === 'videoinput') {
        // Eğer arka kamera (back camera) varsa, id'sini alıyoruz
        if (device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear")) {
          videoDeviceId = device.deviceId;
        }
      }
    });

    // Eğer arka kamera bulunmuşsa, onu kullanıyoruz
    if (videoDeviceId) {
      navigator.mediaDevices.getUserMedia({
        video: { deviceId: videoDeviceId }
      }).then(stream => {
        const videoElement = document.getElementById('preview');
        videoElement.srcObject = stream;
        videoElement.play();  // Videoyu başlatıyoruz
      }).catch(error => {
        console.error("Kamera erişim hatası:", error);
      });
    } else {
      // Eğer arka kamera bulunamazsa, varsayılan olarak ön kamerayı kullanıyoruz
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const videoElement = document.getElementById('preview');
          videoElement.srcObject = stream;
          videoElement.play();  // Videoyu başlatıyoruz
        })
        .catch(error => {
          console.error("Kamera erişim hatası:", error);
        });
    }
  })
  .catch(error => {
    console.error("Cihazları listeleme hatası:", error);
  });

function scanQRCode() {
  const videoElement = document.getElementById('preview');
  const canvasElement = document.createElement('canvas');
  const canvasContext = canvasElement.getContext('2d');

  // Video'nun boyutlarını ayarlıyoruz
  canvasElement.height = videoElement.videoHeight;
  canvasElement.width = videoElement.videoWidth;

  // Video görüntüsünü alıyoruz
  canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  // QR kodu tarıyoruz
  const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const code = jsQR(imageData.data, canvasElement.width, canvasElement.height);

  if (code) {
    // QR kodu bulundu
    document.getElementById('status').textContent = `Taranan TB: ${code.data}`;

    // TB verisi ile karşılaştırma yapıyoruz
    const foundTB = tbList.find(tb => tb.tb === code.data);
    if (foundTB) {
      alert(`Çıkış Yeri TB: ${foundTB.name}`);
    } else {
      alert("Geçersiz TB kodu");
    }
  }

  // QR taramasını sürekli tekrarlıyoruz
  requestAnimationFrame(scanQRCode);
}

// Kamera açılınca hemen taramaya başla
window.onload = function() {
  scanQRCode();
};
