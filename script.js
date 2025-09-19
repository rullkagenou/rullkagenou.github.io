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
        images: data.result.images || null
      };
    }
  }
  return null;
}

function renderResult(data){
  const result = document.getElementById('result');
  result.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';

  const title = document.createElement('h3');
  title.className = 'result-title';
  title.textContent = data.title || 'Tanpa judul';
  card.appendChild(title);

  if(data.author){
    const auth = document.createElement('p');
    auth.className = 'muted';
    auth.innerHTML = `<i class="fa-solid fa-user"></i> ${data.author}`;
    card.appendChild(auth);
  }

  if(data.type === 'video'){
    const vid = document.createElement('video');
    vid.controls = true;
    vid.poster = data.cover;
    vid.src = data.noWatermarkUrl || data.watermarkUrl;
    card.appendChild(vid);

    if(data.noWatermarkUrl){
      card.innerHTML += `<a href="${data.noWatermarkUrl}" target="_blank" class="download-btn">
        <i class="fa-solid fa-video"></i> Unduh Tanpa Watermark
      </a>`;
    }
    if(data.watermarkUrl){
      card.innerHTML += `<a href="${data.watermarkUrl}" target="_blank" class="download-btn">
        <i class="fa-solid fa-water"></i> Unduh Dengan Watermark
      </a>`;
    }
    if(data.musicUrl){
      card.innerHTML += `<a href="${data.musicUrl}" target="_blank" class="download-btn">
        <i class="fa-solid fa-music"></i> Unduh Musik
      </a>`;
    }

  } else if(data.type === 'slider' && Array.isArray(data.images)){
    const wrap = document.createElement('div');
    wrap.className = 'slider-wrap';

    const img = document.createElement('img');
    img.className = 'slider-img';
    img.src = data.images[0];
    wrap.appendChild(img);

    const prev = document.createElement('button');
    prev.className = 'nav-btn nav-prev';
    prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    const next = document.createElement('button');
    next.className = 'nav-btn nav-next';
    next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    wrap.appendChild(prev);
    wrap.appendChild(next);

    const counter = document.createElement('div');
    counter.className = 'counter';
    counter.textContent = `1 / ${data.images.length}`;
    wrap.appendChild(counter);

    let idx = 0;
    prev.onclick = ()=>{
      idx = (idx-1+data.images.length)%data.images.length;
      img.src = data.images[idx];
      counter.textContent = `${idx+1} / ${data.images.length}`;
    };
    next.onclick = ()=>{
      idx = (idx+1)%data.images.length;
      img.src = data.images[idx];
      counter.textContent = `${idx+1} / ${data.images.length}`;
    };

    card.appendChild(wrap);

    card.innerHTML += `<a href="${data.images.join(',')}" target="_blank" class="download-btn">
      <i class="fa-solid fa-images"></i> Unduh Semua Gambar
    </a>`;
    if(data.musicUrl){
      card.innerHTML += `<a href="${data.musicUrl}" target="_blank" class="download-btn">
        <i class="fa-solid fa-music"></i> Unduh Musik
      </a>`;
    }
  }

  result.appendChild(card);
}

// =============================
//  THEME TOGGLE
// =============================
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', ()=>{
  document.body.classList.toggle('light-mode');
  const icon = themeToggle.querySelector('i');
  if(document.body.classList.contains('light-mode')){
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }else{
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
});

// =============================
//  PRELOADER
// =============================
window.addEventListener('load', ()=>{
  const preloader = document.getElementById('preloader');
  preloader.style.opacity = '0';
  setTimeout(()=>preloader.style.display='none',400);
});

// =============================
//  VIEW COUNTER (dummy local)
// =============================
let views = localStorage.getItem('viewsCount') || 0;
views++;
localStorage.setItem('viewsCount', views);
document.getElementById('viewsCount').textContent = views;

// =============================
//  BATTERY INFO
// =============================
if(navigator.getBattery){
  navigator.getBattery().then(battery=>{
    function updateBattery(){
      document.getElementById('batteryLevel').textContent = Math.round(battery.level*100) + '%';
    }
    updateBattery();
    battery.addEventListener('levelchange', updateBattery);
  });
}