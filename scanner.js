// Kamerayı başlatma işlemi
const video = document.getElementById('preview');
const statusText = document.getElementById('status');
const lastScanned = document.getElementById('lastScanned');

// QR kodu tarama için canvas oluşturma
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

// Kamera akışını başlat
function startCamera(facingMode = 'environment') {
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: facingMode // 'user' => ön kamera, 'environment' => arka kamera
    }
  })
    .then(stream => {
      video.srcObject = stream;
      video.play();
      statusText.innerText = 'Kamera başlatıldı...';
    })
    .catch(err => {
      statusText.innerText = 'Kamera açılırken hata oluştu: ' + err;
    });
}

// Arka kamerayı başlatıyoruz
startCamera('environment');

// QR kodu tarama işlemi
function scanQRCode() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      const tb = code.data.trim(); // QR'dan alınan değer
      console.log("Taranan QR:", tb); // Taranan QR'ı konsola yazdır

      // Ekranda gösterme
      lastScanned.innerText = `📦 Taranan TB: ${tb}`;
      lastScanned.style.color = "green"; // Mesajın rengini yeşil yap

      // QR kodunun geçerli olup olmadığını kontrol et
      if (tbList.includes(tb)) {
        statusText.innerText = `✅ Geçerli TB: ${tb}`;
        statusText.style.color = "green";
      } else {
        statusText.innerText = `❌ Geçersiz TB: ${tb}`;
        statusText.style.color = "red";
      }
    }
  }
  requestAnimationFrame(scanQRCode); // Tarama işlemini devam ettir
}

// Tarama işlemini başlat
scanQRCode();
