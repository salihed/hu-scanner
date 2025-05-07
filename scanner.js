const video = document.getElementById('preview');
const statusText = document.getElementById('status');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

// Kamera başlatma fonksiyonu
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // iOS için
    requestAnimationFrame(tick);
  } catch (err) {
    console.error("Kamera açılamadı:", err);
    statusText.innerText = "Kamera erişimi reddedildi veya desteklenmiyor.";
  }
}

function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      const tb = code.data.trim();
      if (tbList.includes(tb)) {
        statusText.innerText = `✅ Geçerli TB: ${tb}`;
        statusText.style.color = "green";
      } else {
        statusText.innerText = `❌ Geçersiz TB: ${tb}`;
        statusText.style.color = "red";
      }
    }
  }
  requestAnimationFrame(tick);
}

// Kamera destekleniyor mu kontrolü
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  startCamera();
} else {
  statusText.innerText = "Tarayıcınız kamera desteği sunmuyor.";
}
