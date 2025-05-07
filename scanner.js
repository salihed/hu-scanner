// Kamerayı başlatma işlemi
const video = document.getElementById('preview');
const statusText = document.getElementById('status');
const lastScanned = document.getElementById('lastScanned');

// QR kodu tarama için canvas oluşturma
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

// Kamerayı başlat
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    video.play();
    statusText.innerText = 'Kamera başlatıldı...';
  })
  .catch(err => {
    statusText.innerText = 'Kamera açılırken hata oluştu: ' + err;
  });

// QR kodu tarama işlemi
function scanQRCode() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      const tb = code.data.trim();  // QR'dan alınan değer
      console.log("Taranan QR:", tb);  // Taranan QR'ı konsola yazdır

      lastScanned.innerText = `📦 Taranan TB: ${tb}`;  // Ekranda göster
      lastScanned.style.color = "green";  // Mesajın rengini yeşil yap

      // QR kodu geçerli mi kontrol et
      if (tbList.includes(tb)) {
        statusText.innerText = `✅ Geçerli TB: ${tb}`;
        statusText.style.color = "green";
      } else {
        statusText.innerText = `❌ Geçersiz TB: ${tb}`;
        statusText.style.color = "red";
      }
    }
  }
  requestAnimationFrame(scanQRCode);  // Tarama işlemini devam ettir
}

// Tarama işlemini başlat
scanQRCode();
