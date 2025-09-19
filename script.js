const API_ENDPOINTS = [
  'https://www.tikwm.com/api/?url=', 
  'https://vapis.my.id/api/ttdl?url=',
  'https://api.vreden.web.id/api/tiktok?url='
];

function openAdmin(){
  window.open("https://wa.me/6283892730732?text=Bang%20Rullz%20web%20nya%20eror", "_blank", "rel=noopener noreferrer");
}
async function pasteClipboard(){
  try{
    const text = await navigator.clipboard.readText();
    if(text) document.getElementById('urlInput').value = text.trim();
    else showModal('Clipboard kosong atau tidak ada link yang disalin.');
  }catch(e){
    showModal('Gagal akses clipboard, tempel manual (CTRL/⌘+V).');
  }
}

function setStatus(msg, color='#cbd5e1', spin=false){
  const el = document.getElementById('statusMessage');
  el.style.display = msg ? 'block' : 'none';
  el.style.color = color;
  el.innerHTML = msg ? (spin ? `<span class="spinner"></span>${msg}` : msg) : '';
}

function showModal(message){
  document.getElementById('modalMessage').textContent = message;
  document.getElementById('errorModal').classList.add('show');
}
function closeModal(){
  document.getElementById('errorModal').classList.remove('show');
}

function disableBtn(disabled){
  const btn = document.getElementById('submitBtn');
  btn.disabled = disabled;
  btn.textContent = disabled ? 'Memproses...' : 'Unduh';
}

async function handleSubmit(){
  const url = document.getElementById('urlInput').value.trim();
  const result = document.getElementById('result');

  if(!url){ showModal('Masukkan URL TikTok yang valid.'); return; }

  result.innerHTML = '';
  setStatus('Memproses tautan, mohon tunggu...', '#cbd5e1', true);
  disableBtn(true);

  let responseData = null;

  for (let i=0;i<API_ENDPOINTS.length;i++){
    const api = API_ENDPOINTS[i];
    try{
      setStatus(`Mencoba server #${i+1}...`, '#facc15', true);
      const data = await fetchApi(api + encodeURIComponent(url));
      const parsed = parseApiResponse(data, api);
      if(parsed){ responseData = parsed; break; }
    }catch(e){
      console.warn('API error', api, e);
    }
  }

  disableBtn(false);
  if(!responseData){
    setStatus('');
    showModal('Konten tidak bisa diunduh saat ini. Coba link lain atau ulangi beberapa saat lagi.');
    return;
  }

  setStatus('');
  renderResult(responseData);
}

async function fetchApi(apiUrl){
  const res = await fetch(apiUrl);
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json().catch(()=>{throw new Error('Invalid JSON')});
  return json;
}

function parseApiResponse(data, apiUrl){
  if(apiUrl.includes('tikwm.com')){
    if(data && data.code === 0 && data.data){
      return {
        type: data.data.images ? 'slider' : 'video',
        title: data.data.title,
        author: data.data.author?.unique_id,
        cover: data.data.cover,
        noWatermarkUrl: data.data.play,
        watermarkUrl: data.data.wmplay,
        musicUrl: data.data.music,
        images: data.data.images || null
      };
    }
  }
  if(apiUrl.includes('vapis.my.id')){
    if(data && data.status === 'success' && data.result){
      return {
        type: data.result.images?.length ? 'slider' : 'video',
        title: data.result.title,
        author: data.result.author?.unique_id,
        cover: data.result.cover,
        noWatermarkUrl: data.result.video?.no_watermark,
        watermarkUrl: data.result.video?.watermark,
        musicUrl: data.result.audio,
        images: data.result.images || null
      };
    }
  }
  if(apiUrl.includes('vreden.web.id')){
    if(data && data.status && data.result){
      const nowm = data.result.data?.find(x=>x.type==='nowatermark')?.url;
      const wm   = data.result.data?.find(x=>x.type==='watermark')?.url;
      return {
        type: data.result.images?.length ? 'slider' : 'video',
        title: data.result.title,
        author: data.result.author?.fullname || data.result.author?.unique_id,
        cover: data.result.cover,
        noWatermarkUrl: nowm,
        watermarkUrl: wm,
        musicUrl: data.result.music_info?.url,
        images: data.result.images || null}
  }
  return null;
}

function renderResult(data){
  const result = document.getElementById('result');
  result.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';

  let mediaHTML = '';
  if(data.type === 'video'){
    mediaHTML = `
      <video controls poster="${data.cover}">
        <source src="${data.noWatermarkUrl}" type="video/mp4">
      </video>`;
  } else if(data.type === 'slider' && data.images){
    mediaHTML = `
      <div class="slider-wrap">
        <button class="nav-btn nav-prev" onclick="prevSlide()">❮</button>
        <img id="sliderImg" class="slider-img" src="${data.images[0]}" alt="slide">
        <button class="nav-btn nav-next" onclick="nextSlide()">❯</button>
        <div id="counter" class="counter">1 / ${data.images.length}</div>
      </div>`;
    window.sliderImages = data.images;
    window.currentIndex = 0;
  }

  card.innerHTML = `
    <h3 class="result-title">${data.title || 'Tanpa Judul'}</h3>
    <p class="muted">@${data.author || 'Unknown'}</p>
    ${mediaHTML}
    <div class="btn-group" style="margin-top:12px;flex-direction:column">
      ${data.noWatermarkUrl ? `<a class="download-btn" href="${data.noWatermarkUrl}" target="_blank" download>Unduh Video (No WM)</a>`:''}
      ${data.watermarkUrl ? `<a class="btn-blue" href="${data.watermarkUrl}" target="_blank" download>Unduh Video (WM)</a>`:''}
      ${data.musicUrl ? `<a class="btn-green" href="${data.musicUrl}" target="_blank" download>Unduh Audio</a>`:''}
    </div>
  `;
  result.appendChild(card);
}

function nextSlide(){
  if(!window.sliderImages) return;
  window.currentIndex = (window.currentIndex+1) % window.sliderImages.length;
  updateSlide();
}
function prevSlide(){
  if(!window.sliderImages) return;
  window.currentIndex = (window.currentIndex-1+window.sliderImages.length) % window.sliderImages.length;
  updateSlide();
}
function updateSlide(){
  const img = document.getElementById('sliderImg');
  const counter = document.getElementById('counter');
  if(img && counter){
    img.src = window.sliderImages[window.currentIndex];
    counter.textContent = `${window.currentIndex+1} / ${window.sliderImages.length}`;
  }
}

// Preloader
window.addEventListener('load', ()=>{
  const preloader = document.getElementById('preloader');
  if(preloader){
    preloader.style.opacity = '0';
    setTimeout(()=>preloader.style.display='none', 500);
  }
});

const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', ()=>{
  document.body.classList.toggle('light-mode');
  const icon = themeToggle.querySelector('i');
  if(document.body.classList.contains('light-mode')){
    icon.classList.replace('fa-moon','fa-sun');
  }else{
    icon.classList.replace('fa-sun','fa-moon');
  }
});

(function(){
  let views = localStorage.getItem('viewsCount') || Math.floor(Math.random()*500+100);
  views = parseInt(views)+1;
  localStorage.setItem('viewsCount', views);
  document.getElementById('viewsCount').textContent = views.toLocaleString();
})();


if(navigator.getBattery){
  navigator.getBattery().then(battery=>{
    updateBattery(battery);
    battery.addEventListener('levelchange', ()=>updateBattery(battery));
  });
}
function updateBattery(battery){
  const level = Math.round(battery.level*100) + '%';
  document.getElementById('batteryLevel').textContent = level;
}