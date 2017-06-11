let wam;
let media = 'video';
let jsActive = true;
let jsCanvas = true;
let playing = true;
let filter = 'Normal', prevFilter;
let frameNum;
let slowSpeed = 0.5, fastSpeed = 2;
let t0, t1 = Infinity, t2, t3 = Infinity, line1, line2, perf1, perf2, perfStr1, perfStr2, avg1, avg2, wasmStats, jsStats, percent=0;
let counter=0, sum1=0, sum2=0;
let pixels, pixels2;
let cw, cw2, ch, ch2;
let speedDiv = document.getElementById('speedHead');
let avgDisplay = document.getElementById('avg');
loadTurboWASM()
  .then(module => {
    wam = module;
}).catch((err) => {
  console.log('Error in fetching module: ', err);
}).then(() => {
    window.onload = (() => {
      createStats();
      addButtons();
      graphStats();
      appendWasmCheck();
    })();
});

function disableJS() {
  jsActive = !jsActive;
  if (!jsActive) document.getElementById('jsButton').innerHTML = 'Enable JavaScript';
  else document.getElementById('jsButton').innerHTML = 'Disable JavaScript';
}

function disableJsCanvas() {
  jsCanvas = !jsCanvas;
  if (jsCanvas) {
    document.getElementById('jsCanvas').innerHTML = 'Hide JS Canvas';
    document.getElementById('jsCanvasHeading').style.visibility = "visible";
    document.getElementById('c2').style.visibility = "visible";
  }
  else {
    document.getElementById('jsCanvas').innerHTML = 'Show JS Canvas';
    document.getElementById('jsCanvasHeading').style.visibility = "hidden";
    document.getElementById('c2').style.visibility = "hidden";
  }
}
function webcamToggle() {
  media = media === 'video' ? 'webcam' : 'video';
  if(media==='webcam') {
    controlContent = document.getElementById('controls').innerHTML;
    timingContent = document.getElementById('timing').innerHTML;
    document.getElementById('webcamButton').innerHTML = 'Switch to Video';
    navigator.mediaDevices.getUserMedia({video: true})
        .then((stream) => {
            vid.srcObject = stream;
            vid2.srcObject = stream;
            document.getElementById('controls').innerHTML = "Switch back to video for player controls";
            document.getElementById('timing').innerHTML = '';
        })
        .catch(function(err) {
            media = 'video';
            console.log(err.name);
        });
  }
  else {
    document.getElementById('controls').innerHTML = controlContent;
    document.getElementById('timing').innerHTML = timingContent;
    document.getElementById('webcamButton').innerHTML = 'Switch to Webcam';
    vid.srcObject = null;
    vid2.srcObject = null;
  }
  
}
//wasm video
var vid = document.getElementById('v');
var canvas = document.getElementById('c');
var context = canvas.getContext('2d');
vid.addEventListener("loadeddata", function() {
  canvas.setAttribute('height', vid.videoHeight);
  canvas.setAttribute('width', vid.videoWidth);
  cw = canvas.clientWidth; //usually same as canvas.height
  ch = canvas.clientHeight;
  draw();
  timeData();
});

//javascript video
var vid2 = document.getElementById('v2');
var canvas2 = document.getElementById('c2');
var context2 = canvas2.getContext('2d');
vid2.addEventListener("loadeddata", function() {
  canvas2.setAttribute('height', vid2.videoHeight);
  canvas2.setAttribute('width', vid2.videoWidth);
  cw2 = canvas2.clientWidth; //usually same as canvas.height
  ch2 = canvas2.clientHeight;
  draw2();
});

function draw() {
  if (vid.paused) return false;
  context.drawImage(vid, 0, 0);
  // console.log('check', vid, context);
  pixels = context.getImageData(0, 0, vid.videoWidth, vid.videoHeight);
  if (filter !== 'Normal') {
    t0 = performance.now();
    setPixels(filter, 'wasm');
    //doublePixels('Longhorn', 'Sunset'); - Order matters, kind of cool 
    t1 = performance.now();
  }
  context.putImageData(pixels, 0, 0);
  frameNum = requestAnimationFrame(draw); 
}
//for javascript example
function draw2() {
  if (vid2.paused) return false;
  context2.drawImage(vid2, 0, 0);
  pixels2 = context2.getImageData(0, 0, vid2.videoWidth, vid2.videoHeight);
  if (filter !== 'Normal') {
    t2 = performance.now();
    setPixels(filter, 'js');
    t3 = performance.now();
  }
  context2.putImageData(pixels2, 0, 0);
  requestAnimationFrame(draw2);  
}

//case for when loop is off and video pauses at end without someone clicking play button
vid.onpause = () => document.getElementById('playImg').setAttribute('src', 'img/play1.svg');

function playToggle () { //does both vids together
  if (vid.paused) {
    document.getElementById('playImg').setAttribute('src', 'img/pause1.svg')
    vid.play();
    vid2.play()
    draw();
    draw2();
  }
  else {
    document.getElementById('playImg').setAttribute('src', 'img/play1.svg')
    vid.pause()
    vid2.pause()
  }
}
function rewind() {
  vid.currentTime = vid.currentTime - 5 > 0 ? vid.currentTime - 5 : 0;
  vid2.currentTime = vid2.currentTime - 5 > 0 ? vid2.currentTime - 5 : 0;

}
function fastForward() {
  vid.currentTime = vid.currentTime + 5 > vid.duration ? vid.duration : vid.currentTime + 5;
  vid2.currentTime = vid2.currentTime + 5 > vid2.duration ? vid2.duration : vid2.currentTime + 5;

}
function loopToggle () { //does both vids together
  if (vid.hasAttribute('loop')){
    document.getElementById('loopImg').setAttribute('src', 'img/loop1.svg')
    vid.removeAttribute('loop')
    vid2.removeAttribute('loop')
  }
  else {
    if (vid.paused) {
      playToggle();
    }
    document.getElementById('loopImg').setAttribute('src', 'img/noloop1.svg')
    vid.setAttribute('loop', 'true')
    vid2.setAttribute('loop', 'true')
  }

}
function timeData () {
  //FrameNum in Time div, and then time in Canvas div;
  //Can put total frames next to video length; 
  let vidTime = document.getElementById('vidTime');
  function getTimeCode(microseconds) {
    let hours = Math.floor(microseconds / 3600);
    if (hours < 10) hours = '0' + hours;
    let minutes = Math.floor(microseconds/ 60);
    if (minutes < 10) minutes = '0' + minutes;
    let seconds = Math.floor(microseconds);
    if (seconds < 10) seconds = '0' + seconds;
    let milliseconds = microseconds - seconds;
    milliseconds = String(milliseconds).slice(2,4);
    return result = `${String(hours)} : ${String(minutes)} : ${String(seconds)} : ${String(milliseconds)}`;
  }
  //add thing for frameNum;  
  vidTime.innerHTML = `${getTimeCode(vid.currentTime)}`;
  setTimeout(timeData,15);
}

function slowToggle () {
  if (vid.playbackRate === slowSpeed) {
    document.getElementById('slowButton').innerHTML = 'Toggle Slow Motion';
    vid.playbackRate = 1;
    vid2.playbackRate = 1;
  }
  else if (vid.playbackRate === 1.0) {
    document.getElementById('slowButton').innerHTML = 'Toggle Regular Speed';
    vid.playbackRate = slowSpeed;
    vid2.playbackRate = slowSpeed;
  }
  else if (vid.playbackRate === fastSpeed) {
    document.getElementById('slowButton').innerHTML = 'Toggle Regular Speed';
    document.getElementById('fastButton').innerHTML = 'Toggle Fast Motion';
    vid.playbackRate = slowSpeed;
    vid2.playbackRate = slowSpeed;
  }
}
function fastToggle () {
  if (vid.playbackRate === fastSpeed) {
    document.getElementById('fastButton').innerHTML = 'Toggle Fast Motion';
    vid.playbackRate = 1;
    vid2.playbackRate = 1;
  }
  else if (vid.playbackRate === 1.0) {
    document.getElementById('fastButton').innerHTML = 'Toggle Regular Speed';
    vid.playbackRate = fastSpeed;
    vid2.playbackRate = fastSpeed;
  }
  else if (vid.playbackRate === slowSpeed) {
    document.getElementById('fastButton').innerHTML = 'Toggle Regular Speed';
    document.getElementById('slowButton').innerHTML = 'Toggle Slow Motion';
    vid.playbackRate = fastSpeed;
    vid2.playbackRate = fastSpeed;
  }
}




//STATS, Buttons adding, SetPixels function stuff starts below
function graphStats () {
  // reset values;
  if (prevFilter !== filter) {
    perf1 = 0;
    perf2 = 0;
    sum1 = 0;
    sum2 = 0;
    avg1 = 0;
    avg2 = 0;
    counter = 0;
  };

  if (filter !== 'Normal') {
    perf1 = t1 - t0;
    perf2 = t3 - t2;
    sum1 += perf1;
    sum2 += perf2;
    counter += 1;
    if (counter % 5 === 0) {
      avg1 = sum1 / counter;
      avg2 = sum2 / counter;
      avgDisplay.innerText = `Average computation time WASM: ${avg1.toString().slice(0, 4)} ms, JS: ${avg2.toString().slice(0, 4)} ms`;
      line1.append(new Date().getTime(), 500 / perf1);
      line2.append(new Date().getTime(), 500 / perf2);
    }
    perfStr1 = perf1.toString().slice(0, 4);
    perfStr2 = perf2.toString().slice(0, 5);
    wasmStats = `WASM computation time: ${perfStr1} ms`;
    jsStats = ` JS computation time: ${perfStr2} ms`;
    document.getElementById("stats").textContent = wasmStats + jsStats;
    percent = Math.round(((perf2 - perf1) / perf1) * 100);
  }
  if (filter !== 'Normal' && jsActive) {
    speedDiv.innerText = `Performance Comparison: WASM is currently ${percent}% faster than JS`;
  }
  else speedDiv.innerText = 'Performance Comparison';

  prevFilter = filter;
  setTimeout(graphStats, 500);
}

function createStats() {
  let smoothie = new SmoothieChart({
    maxValueScale: 1.1,
    minValueScale: 0.5,
    grid: {
      strokeStyle: 'rgb(60, 60, 60)',
      fillStyle: 'rgb(30, 30, 30)',
      lineWidth: 1,
      millisPerLine: 250,
      verticalSections: 5,
    },
    labels: {
      fillStyle: 'rgb(255, 255, 255)',
      fontSize: 14,
    },
  });
  // send smoothie data to canvas
  smoothie.streamTo(document.getElementById('statsCanvas'), 500);
  
  // declare smoothie timeseries 
  line1 = new TimeSeries();
  line2 = new TimeSeries();
  
  // define graph lines and colors
  smoothie.addTimeSeries(line1,
    {
      strokeStyle: 'rgb(0, 255, 0)',
      fillStyle: 'rgba(0, 255, 0, 0.075)',
      lineWidth: 3,
    }
  );
  smoothie.addTimeSeries(line2,
    { strokeStyle: 'rgb(0, 0, 255)',
      fillStyle: 'rgba(0, 0, 255, 0.075)',
      lineWidth: 3,
    }
  );
}

function addButtons (filtersArr) {
  const filters = ['Normal', 'Grayscale', 'Invert', 'Bacteria', 'Sunset', 
                  'Emboss', 'Super Edge', 'Super Edge Inv',
                 'Gaussian Blur', 'Moss', 'Robbery', 'Brighten', 'Swamp','Ghost',  'Good Morning', 'Acid', 'Urple', 'Romance', 'Hippo', 'Longhorn', 'Security', 'Underground', 'Rooster', 'Mist', 'Tingle', 'Kaleidoscope', 'Noise', 'Forest', 'Dewdrops', 'Analog TV', 'Color Destruction', 'Hulk Edge', 'Twisted',  'Clarity', 'Sharpen','Uber Sharpen'];
  const buttonDiv = document.createElement('div');
  buttonDiv.id = 'filters';
  const editor = document.getElementById('editor')
  editor.insertBefore(buttonDiv, editor.firstChild);
  for (let i = 0; i < filters.length; i++) {
    let filterDiv = document.createElement('div');
    filterDiv.className = "indFilter";
    filterDiv.innerText = filters[i];
    filterDiv.addEventListener('click', function() {
      filter = filters[i];
      //remove any that have it;
      if(document.getElementsByClassName('selectedFilter')[0]) document.getElementsByClassName('selectedFilter')[0].classList.remove('selectedFilter');
      this.classList.add('selectedFilter');
    });
    buttonDiv.appendChild(filterDiv);
  }
}

function appendWasmCheck () {
  let p = document.createElement('p');
  p.className = 'wasmCheck';
  let before = document.getElementById('editor');
  if ('WebAssembly' in window) {
    p.innerHTML = '(\u2713 WebAssembly is supported in your browser)';
    document.body.insertBefore(p,before);
  }
  else if (/Mobi/.test(navigator.userAgent)) {
    document.getElementById('statsContainer').innerHTML = `<h3 style="color:#a37c6e;">\u2639 WebAssembly is not yet supported on mobile devices. Please view on desktop browser.</h3>`
  }
  else {
    document.getElementById('statsContainer').innerHTML = `<h3 style="color:#a37c6e;">\u2639 WebAssembly is not supported in your browser. Please update to the latest version of Chrome or Firefox to enable WebAssembly and compare .WASM & .JS performance</h3>`
  }
}


function setPixels (filter, language) {
  if (language === 'wasm') {
    let kernel, divisor;
    switch (filter) {
      case 'Grayscale': pixels.data.set(wam.grayScale(pixels.data)); break;
      case 'Brighten': pixels.data.set(wam.brighten(pixels.data)); break;
      case 'Invert': pixels.data.set(wam.invert(pixels.data)); break;
      case 'Noise': pixels.data.set(wam.noise(pixels.data)); break;
      case 'Sunset': pixels.data.set(wam.sunset(pixels.data, cw)); break;
      case 'Analog TV': pixels.data.set(wam.analogTV(pixels.data, cw)); break;
      case 'Emboss': pixels.data.set(wam.emboss(pixels.data, cw)); break;
      case 'Super Edge': pixels.data.set(wam.sobelFilter(pixels.data, cw, ch)); break;
      case 'Super Edge Inv': pixels.data.set(wam.sobelFilter(pixels.data, cw, ch, true)); break;
      case 'Gaussian Blur': pixels.data.set(wam.blur(pixels.data, cw, ch)); break;
      case 'Sharpen': pixels.data.set(wam.sharpen(pixels.data, cw, ch)); break;      
      case 'Uber Sharpen': pixels.data.set(wam.strongSharpen(pixels.data, cw, ch)); break;
      case 'Clarity': pixels.data.set(wam.clarity(pixels.data, cw, ch)); break;
      case 'Good Morning': pixels.data.set(wam.goodMorning(pixels.data, cw, ch)); break;
      case 'Acid': pixels.data.set(wam.acid(pixels.data, cw, ch)); break;
      case 'Urple': pixels.data.set(wam.urple(pixels.data, cw)); break;
      case 'Forest': pixels.data.set(wam.forest(pixels.data, cw)); break;
      case 'Romance': pixels.data.set(wam.romance(pixels.data, cw)); break;
      case 'Hippo': pixels.data.set(wam.hippo(pixels.data, cw)); break;
      case 'Longhorn': pixels.data.set(wam.longhorn(pixels.data, cw)); break;
      case 'Underground': pixels.data.set(wam.underground(pixels.data, cw)); break;
      case 'Rooster': pixels.data.set(wam.rooster(pixels.data, cw)); break;
      case 'Moss': pixels.data.set(wam.moss(pixels.data, cw)); break;
      case 'Mist': pixels.data.set(wam.mist(pixels.data, cw)); break;
      case 'Tingle': pixels.data.set(wam.tingle(pixels.data, cw)); break;
      case 'Kaleidoscope': pixels.data.set(wam.kaleidoscope(pixels.data, cw)); break;
      case 'Bacteria': pixels.data.set(wam.bacteria(pixels.data, cw)); break;
      case 'Dewdrops': pixels.data.set(wam.dewdrops(pixels.data, cw, ch)); break;
      case 'Color Destruction': pixels.data.set(wam.destruction(pixels.data, cw, ch)); break;
      case 'Hulk Edge': pixels.data.set(wam.hulk(pixels.data, cw)); break;
      case 'Ghost': pixels.data.set(wam.ghost(pixels.data, cw)); break;
      case 'Swamp': pixels.data.set(wam.swamp(pixels.data, cw)); break;
      case 'Twisted': pixels.data.set(wam.twisted(pixels.data, cw)); break;
      case 'Security': pixels.data.set(wam.security(pixels.data, cw)); break;
      case 'Robbery': pixels.data.set(wam.robbery(pixels.data, cw)); break;
    }
  } else if (jsActive) {
    switch (filter) {
      case 'Grayscale': pixels2.data.set(js_grayScale(pixels2.data)); break;
      case 'Brighten': pixels2.data.set(js_brighten(pixels2.data)); break;
      case 'Invert': pixels2.data.set(js_invert(pixels2.data)); break;
      case 'Noise': pixels2.data.set(js_noise(pixels2.data)); break;
      case 'Sunset': pixels2.data.set(js_sunset(pixels2.data, cw2)); break;
      case 'Analog TV': pixels2.data.set(js_analog(pixels2.data, cw2)); break;
      case 'Emboss': pixels2.data.set(js_emboss(pixels2.data, cw2)); break;
      case 'Super Edge': pixels2.data.set(js_sobelFilter(pixels2.data, cw2, ch2)); break;
      case 'Super Edge Inv': pixels2.data.set(js_sobelFilter(pixels2.data, cw2, ch2, true)); break;
      case 'Gaussian Blur': pixels2.data.set(js_blur(pixels2.data, cw2, ch2));break;
      case 'Sharpen': pixels2.data.set(js_sharpen(pixels2.data, cw2, ch2)); break;
      case 'Uber Sharpen': pixels2.data.set(js_strongSharpen(pixels2.data, cw2, ch2)); break;
      case 'Clarity': pixels2.data.set(js_clarity(pixels2.data, cw2, ch2)); break;
      case 'Good Morning': pixels2.data.set(js_goodMorning(pixels2.data, cw2, ch2)); break;
      case 'Acid': pixels2.data.set(js_acid(pixels2.data, cw2, ch2)); break;
      case 'Urple': pixels2.data.set(js_urple(pixels2.data, cw2)); break;
      case 'Forest': pixels2.data.set(js_forest(pixels2.data, cw2)); break;
      case 'Romance': pixels2.data.set(js_romance(pixels2.data, cw2)); break;
      case 'Hippo': pixels2.data.set(js_hippo(pixels2.data, cw2)); break;
      case 'Longhorn': pixels2.data.set(js_longhorn(pixels2.data, cw2)); break;
      case 'Underground': pixels2.data.set(js_underground(pixels2.data, cw2)); break;
      case 'Rooster': pixels2.data.set(js_rooster(pixels2.data, cw2)); break;
      case 'Mist': pixels2.data.set(js_mist(pixels2.data, cw2)); break;
      case 'Moss': pixels2.data.set(js_mist(pixels2.data, cw2)); break;
      case 'Tingle': pixels2.data.set(js_tingle(pixels2.data, cw2)); break;
      case 'Kaleidoscope': pixels2.data.set(js_tingle(pixels2.data, cw2)); break;
      case 'Bacteria': pixels2.data.set(js_bacteria(pixels2.data, cw2)); break;
      case 'Dewdrops': pixels2.data.set(js_dewdrops(pixels2.data, cw2, ch2)); break;
      case 'Color Destruction': pixels2.data.set(js_destruction(pixels2.data, cw2, ch2)); break;
      case 'Hulk Edge': pixels2.data.set(js_hulk(pixels2.data, cw2)); break;
      case 'Ghost': pixels2.data.set(js_ghost(pixels2.data, cw2)); break;
      case 'Swamp': pixels2.data.set(js_twisted(pixels2.data, cw2)); break;
      case 'Twisted': pixels2.data.set(js_twisted(pixels2.data, cw2)); break;
      case 'Security': pixels2.data.set(js_security(pixels2.data, cw2)); break;
      case 'Robbery': pixels2.data.set(js_security(pixels2.data, cw2)); break;
    }
  }
}
function doublePixels (filter1, filter2) {
  setPixels(filter1, 'wasm');
  setPixels(filter2, 'wasm');
}