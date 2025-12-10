<template>
  <div class="practice-container">
    <div class="curtains" :class="{ 'open': curtainsOpen }">
      <div class="curtain curtain-left"></div>
      <div class="curtain curtain-right"></div>
    </div>

    <div ref="canvasContainer" class="canvas-container"></div>

    <div class="slot-ui" v-if="showUI">
      <div class="slot-controls">
        <div class="balance-display">
          <span class="label">Balance:</span>
          <span class="amount">${{ balance.toFixed(2) }}</span>
        </div>
        
        <div class="bet-controls">
          <Button icon="pi pi-minus" @click="decreaseBet" :disabled="spinning || leverPulling" />
          <div class="bet-amount">
            <span class="label">Bet:</span>
            <span class="amount">${{ currentBet.toFixed(2) }}</span>
          </div>
          <Button icon="pi pi-plus" @click="increaseBet" :disabled="spinning || leverPulling" />
          <Button label="ALL IN" @click="allIn" :disabled="spinning || leverPulling" severity="danger" />
        </div>

        <div class="lever-instruction" v-if="!spinning && !leverPulling && !winMessage && !bankruptMessage">
          <span class="instruction-text"><i class="pi pi-hand-o-up"></i> Pull the lever to spin!</span>
        </div>

        <div class="bankrupt-display" v-if="bankruptMessage">
          <div class="bankrupt-message">{{ bankruptMessage }}</div>
          <div class="bankrupt-subtext">Here's $100 to get back in the game!</div>
        </div>

        <div class="win-display" v-if="winMessage">
          <div class="win-message">{{ winMessage }}</div>
          <div class="last-win">
            <span class="win-label">Won:</span>
            <span class="win-amount">${{ lastWin.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <Button 
        icon="pi pi-arrow-left"
        label="Back to Dashboard" 
        @click="exitPractice" 
        severity="secondary"
        outlined
        class="back-button"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const router = useRouter();
const canvasContainer = ref(null);
const curtainsOpen = ref(false);
const showUI = ref(false);

const balance = ref(100.00);
const currentBet = ref(1.00);
const lastWin = ref(0);
const winMessage = ref('');
const bankruptMessage = ref('');
const spinning = ref(false);
const leverPulling = ref(false);

const modelsLoaded = ref({
  casino: false,
  slotMachine: false,
  lever: false,
  reelsNeeded: 4,
  reelsLoaded: 0
});

let scene, camera, renderer, slotMachine, loadedModel, leverModel, casino;
let reels = [];
const symbols = ['🍊', '🍇', '🍒', '7️⃣', '🔔'];
const symbolIcons = ['pi-sun', 'pi-circle', 'pi-heart', 'pi-star', 'pi-bolt'];
let modelLoaded = false;
let leverLoaded = false;

let isDraggingLever = false;
let leverPullProgress = 0;
let leverRestRotation = 0;
const maxLeverRotation = Math.PI / 3;

const cameraZoomedOut = { x: 0, y: 2, z: 25 };
const cameraZoomedIn = { x: 0, y: 0, z: 15 };

let raycaster, mouse;

const bankruptMessages = [
  "The house always wins... but not today! One more spin could change everything!",
  "You were SO close! The jackpot is practically calling your name!",
  "Winners never quit! That big win is just around the corner!",
  "This is it! Your luck is about to turn, I can feel it!",
  "Statistics say you're DUE for a win! Keep spinning!",
  "Every pro gambler went broke before they hit it big!",
  "Just one more try! What's $100 compared to the JACKPOT?",
  "You've learned from your mistakes, now it's time to WIN!",
];

onMounted(() => {
  initThreeJS();
});

function checkAllModelsLoaded() {
  const allLoaded = modelsLoaded.value.casino && 
                   modelsLoaded.value.slotMachine && 
                   modelsLoaded.value.lever && 
                   modelsLoaded.value.reelsLoaded >= modelsLoaded.value.reelsNeeded;
  
  if (allLoaded && !curtainsOpen.value) {
    setTimeout(() => {
      curtainsOpen.value = true;
      setTimeout(() => {
        showUI.value = true;
      }, 1000);
    }, 500);
  }
}

onUnmounted(() => {
  if (renderer) {
    renderer.dispose();
  }
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('mousedown', onMouseDown);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
});

function initThreeJS() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0a0a);
  
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(cameraZoomedOut.x, cameraZoomedOut.y, cameraZoomedOut.z);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvasContainer.value.appendChild(renderer.domElement);
  
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const spotLight = new THREE.SpotLight(0xffd700, 1);
  spotLight.position.set(0, 10, 10);
  spotLight.angle = Math.PI / 6;
  scene.add(spotLight);
  
  const pointLight1 = new THREE.PointLight(0xff0000, 0.5);
  pointLight1.position.set(-5, 5, 5);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0x0000ff, 0.5);
  pointLight2.position.set(5, 5, 5);
  scene.add(pointLight2);
  
  const frontLight = new THREE.DirectionalLight(0xffffff, 1.2);
  frontLight.position.set(0, 5, 20);
  frontLight.target.position.set(0, 0, 0);
  scene.add(frontLight);
  scene.add(frontLight.target);
  
  createCasinoEnvironment();
  loadSlotMachineGLB();
  
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchstart', onTouchStart);
  window.addEventListener('touchmove', onTouchMove);
  window.addEventListener('touchend', onTouchEnd);
  
  animate();
}

function createCasinoEnvironment() {
  const loader = new GLTFLoader();

  loader.load(
    '/models/gameready_casino_scene.glb',
    (gltf) => {
      loadedModel = gltf.scene;
      casino = new THREE.Group();
      
      casino.add(loadedModel);
      casino.scale.set(.2, .2, .2);
      casino.position.set(0, -7, -10);
      casino.rotation.y = -Math.PI / 2;
      
      scene.add(casino);
      modelLoaded = true;
      modelsLoaded.value.casino = true;
      
      checkAllModelsLoaded();
    },
    undefined,
    (error) => {
      console.error('Error loading casino model:', error);
    }
  );
}

function loadSlotMachineGLB() {
  const loader = new GLTFLoader();
  
  loader.load(
    '/models/slot_machine.glb',
    (gltf) => {
      loadedModel = gltf.scene;
      slotMachine = new THREE.Group();
      
      slotMachine.add(loadedModel);
      slotMachine.scale.set(10, 10, 10);
      slotMachine.position.set(0, -8, 3);
      slotMachine.rotation.y = 0;
      
      scene.add(slotMachine);
      modelLoaded = true;
      modelsLoaded.value.slotMachine = true;
      
      checkAllModelsLoaded();
      
      loadLever();
      createOverlayReels();
    },
    undefined,
    (error) => {
      console.error('Error loading slot machine model:', error);
    }
  );
}

function loadLever() {
  const loader = new GLTFLoader();
  
  loader.load(
    '/models/lever.glb',
    (gltf) => {
      leverModel = gltf.scene;
      leverModel.name = 'lever';
      
      leverModel.scale.set(1, 1, 1);
      leverModel.position.set(0.56, .8, 0);
      
      leverRestRotation = leverModel.rotation.x;
      
      slotMachine.add(leverModel);
      leverLoaded = true;
      modelsLoaded.value.lever = true;
      
      checkAllModelsLoaded();
    },
    undefined,
    (error) => {
      console.error('Error loading lever:', error);
    }
  );
}

function createOverlayReels() {
  const slotLoader = new GLTFLoader();
  const positions = [
    (0 - 1.41) * .145,
    (1 - 1.41) * .145,
    (2 - 1.41) * .145,
    (3 - 1.41) * .145
  ];
  
  for (let i = 0; i < 4; i++) {
    slotLoader.load(
      '/models/slot.glb',
      (gltf) => {
        const slotReel = gltf.scene.clone();
        
        slotReel.position.set(positions[i], .85, .2);
        slotReel.scale.set(1, 1, 1);
                
        slotMachine.add(slotReel);
        
        reels[i] = {
          group: slotReel,
          targetRotation: 0,
          currentRotation: 0,
          symbolIndex: 0,
          spinning: false,
          position: i
        };
        
        modelsLoaded.value.reelsLoaded++;
        checkAllModelsLoaded();
      },
      undefined,
      (error) => {
        console.error(`Error loading slot ${i + 1}:`, error);
      }
    );
  }
}

function onMouseDown(event) {
  if (spinning.value || !leverLoaded) return;
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(leverModel, true);
  
  if (intersects.length > 0) {
    isDraggingLever = true;
    leverPulling.value = true;
  }
}

function onMouseMove(event) {
  if (!isDraggingLever) return;
  
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  leverPullProgress = Math.max(0, Math.min(1, -mouse.y));
}

function onMouseUp() {
  if (isDraggingLever && leverPullProgress > 0.7) {
    activateSpin();
  }
  isDraggingLever = false;
  resetLever();
}

function onTouchStart(event) {
  if (spinning.value || !leverLoaded || event.touches.length === 0) return;
  
  const touch = event.touches[0];
  mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(leverModel, true);
  
  if (intersects.length > 0) {
    isDraggingLever = true;
    leverPulling.value = true;
  }
}

function onTouchMove(event) {
  if (!isDraggingLever || event.touches.length === 0) return;
  
  const touch = event.touches[0];
  mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  leverPullProgress = Math.max(0, Math.min(1, -mouse.y));
}

function onTouchEnd() {
  if (isDraggingLever && leverPullProgress > 0.7) {
    activateSpin();
  }
  isDraggingLever = false;
  resetLever();
}

function resetLever() {
  const resetDuration = 500;
  const startProgress = leverPullProgress;
  const startTime = Date.now();
  
  function animateReset() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / resetDuration, 1);
    leverPullProgress = startProgress * (1 - progress);
    
    if (progress < 1) {
      requestAnimationFrame(animateReset);
    } else {
      leverPulling.value = false;
    }
  }
  
  animateReset();
}

function activateSpin() {
  if (balance.value <= 0) {
    handleBankruptcy();
    return;
  }
  
  animateCameraZoom();
  
  setTimeout(() => {
    spin();
  }, 1000);
}

function animateCameraZoom() {
  const duration = 1000;
  const startPos = { ...camera.position };
  const startTime = Date.now();
  
  function updateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    
    camera.position.x = startPos.x + (cameraZoomedIn.x - startPos.x) * eased;
    camera.position.y = startPos.y + (cameraZoomedIn.y - startPos.y) * eased;
    camera.position.z = startPos.z + (cameraZoomedIn.z - startPos.z) * eased;
    camera.lookAt(0, 0, 0);
    
    if (progress < 1) {
      requestAnimationFrame(updateCamera);
    }
  }
  
  updateCamera();
}

function animate() {
  requestAnimationFrame(animate);
  
  if (leverModel && leverLoaded) {
    leverModel.rotation.x = leverRestRotation + (leverPullProgress * maxLeverRotation);
  }
  
  reels.forEach(reel => {
    if (reel && reel.spinning) {
      reel.currentRotation += 0.3;
      reel.group.rotation.x = reel.currentRotation;
      reel.group.rotation.z = 0;
      
      if (reel.currentRotation >= reel.targetRotation) {
        reel.spinning = false;
        reel.currentRotation = reel.targetRotation;
        reel.group.rotation.x = reel.targetRotation;
      }
    }
  });
  
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function increaseBet() {
  if (currentBet.value < balance.value) {
    currentBet.value = Math.min(currentBet.value + 0.5, balance.value);
  }
}

function decreaseBet() {
  if (currentBet.value > 0.5) {
    currentBet.value -= 0.5;
  }
}

function allIn() {
  if (balance.value > 0) {
    currentBet.value = balance.value;
  }
}

function handleBankruptcy() {
  const randomMessage = bankruptMessages[Math.floor(Math.random() * bankruptMessages.length)];
  bankruptMessage.value = randomMessage;
  
  setTimeout(() => {
    balance.value = 100.00;
    currentBet.value = 1.00;
    bankruptMessage.value = '';
  }, 4000);
}

function spin() {
  if (spinning.value) return;
  
  if (balance.value <= 0) {
    handleBankruptcy();
    return;
  }
  
  const actualBet = Math.min(currentBet.value, balance.value);
  
  spinning.value = true;
  balance.value -= actualBet;
  lastWin.value = 0;
  winMessage.value = '';
  bankruptMessage.value = '';
  
  reels.forEach((reel, index) => {
    const spins = 5 + index;
    const randomSymbol = Math.floor(Math.random() * symbols.length);
    const anglePerSymbol = (Math.PI * 2) / symbols.length;
    
    reel.targetRotation = reel.currentRotation + (spins * Math.PI * 2) + (randomSymbol * anglePerSymbol);
    reel.spinning = true;
  });
  
  const longestSpinTime = 3000 + (reels.length * 300);
  
  setTimeout(() => {
    const orderedReels = [...reels].sort((a, b) => a.position - b.position);
    
    orderedReels.forEach((reel) => {
      const anglePerSymbol = (Math.PI * 2) / symbols.length;
      
      let normalizedRotation = reel.targetRotation % (Math.PI * 2);
      
      if (normalizedRotation < 0) {
        normalizedRotation += Math.PI * 2;
      }
      
      let symbolIndex = Math.round(normalizedRotation / anglePerSymbol + 0.001) % symbols.length;
      
      reel.symbolIndex = symbolIndex;
    });
    
    const resultSymbols = orderedReels.map(r => symbols[r.symbolIndex]);
    console.log('🎰 Results:', resultSymbols.join(' | '));
    
    checkWin(orderedReels, actualBet);
    spinning.value = false;
    
    zoomCameraOut();
  }, longestSpinTime);
}

function zoomCameraOut() {
  const duration = 1000;
  const startPos = { ...camera.position };
  const startTime = Date.now();
  
  function updateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    
    camera.position.x = startPos.x + (cameraZoomedOut.x - startPos.x) * eased;
    camera.position.y = startPos.y + (cameraZoomedOut.y - startPos.y) * eased;
    camera.position.z = startPos.z + (cameraZoomedOut.z - startPos.z) * eased;
    camera.lookAt(0, 0, 0);
    
    if (progress < 1) {
      requestAnimationFrame(updateCamera);
    }
  }
  
  updateCamera();
}

function checkWin(orderedReels, betAmount) {
  const results = orderedReels.map(r => r.symbolIndex);
  
  if (results[0] === results[1] && results[1] === results[2] && results[2] === results[3]) {
    const multiplier = results[0] === 4 ? 100 : results[0] === 3 ? 50 : 25;
    lastWin.value = betAmount * multiplier;
    balance.value += lastWin.value;
    winMessage.value = 'JACKPOT! Four of a kind!';
  } else if (results[0] === results[1] && results[1] === results[2]) {
    const multiplier = results[0] === 4 ? 50 : results[0] === 3 ? 20 : 10;
    lastWin.value = betAmount * multiplier;
    balance.value += lastWin.value;
    winMessage.value = 'Three in a row!';
  } else if (results[1] === results[2] && results[2] === results[3]) {
    const multiplier = results[1] === 4 ? 50 : results[1] === 3 ? 20 : 10;
    lastWin.value = betAmount * multiplier;
    balance.value += lastWin.value;
    winMessage.value = 'Three in a row!';
  } else if (results[0] === results[1] || results[1] === results[2] || results[2] === results[3]) {
    lastWin.value = betAmount * 2;
    balance.value += lastWin.value;
    winMessage.value = 'Pair!';
  } else {
    winMessage.value = '';
  }
}

function exitPractice() {
  router.push({ name: 'dashboard' });
}
</script>

<style scoped>
.practice-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.curtains {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  pointer-events: none;
}

.curtain {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(to bottom, #8b0000, #4a0000);
  transition: transform 1s ease-in-out;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
}

.curtain-left {
  left: 0;
  transform: translateX(0);
}

.curtain-right {
  right: 0;
  transform: translateX(0);
}

.curtains.open .curtain-left {
  transform: translateX(-100%);
}

.curtains.open .curtain-right {
  transform: translateX(100%);
}

.canvas-container {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.slot-ui {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  z-index: 10;
  pointer-events: none;
}

.slot-ui > * {
  pointer-events: auto;
}

.slot-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.balance-display,
.bet-amount {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  color: #ffd700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
}

.bet-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lever-instruction {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  background: rgba(255, 215, 0, 0.2);
  border: 2px solid #ffd700;
  border-radius: 8px;
}

.instruction-text {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  animation: pulse 2s infinite;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.bankrupt-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 2.5rem;
  background: rgba(255, 0, 0, 0.3);
  border: 3px solid #ff0000;
  border-radius: 8px;
  animation: flash 0.5s ease-out;
  max-width: 600px;
}

@keyframes flash {
  0% { transform: scale(0.8); opacity: 0; background: rgba(255, 0, 0, 0.5); }
  50% { transform: scale(1.15); background: rgba(255, 0, 0, 0.4); }
  100% { transform: scale(1); opacity: 1; background: rgba(255, 0, 0, 0.3); }
}

.bankrupt-message {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6666;
  text-shadow: 0 0 15px #ff0000;
  text-align: center;
  line-height: 1.4;
}

.bankrupt-subtext {
  font-size: 1.1rem;
  color: #ffaa00;
  text-shadow: 0 0 10px #ffaa00;
  text-align: center;
}

.win-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(0, 255, 0, 0.2);
  border: 2px solid #00ff00;
  border-radius: 8px;
  animation: celebrate 0.5s ease-out;
}

@keyframes celebrate {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.win-message {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 15px #00ff00;
  text-align: center;
}

.last-win {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.win-label {
  font-size: 0.875rem;
  color: #00ff00;
  text-transform: uppercase;
}

.win-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
}

.back-button {
  position: fixed;
  top: 2rem;
  left: 2rem;
  background: rgba(0, 0, 0, 0.8) !important;
  border: 2px solid #ffd700 !important;
  color: #ffd700 !important;
  padding: 0.75rem 1.5rem !important;
  font-weight: bold !important;
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(255, 215, 0, 0.2) !important;
  transform: translateX(-5px);
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .slot-controls {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .instruction-text {
    font-size: 1rem;
  }
  
  .win-message {
    font-size: 1.25rem;
  }

  .bankrupt-message {
    font-size: 1.2rem;
  }

  .bankrupt-subtext {
    font-size: 0.95rem;
  }
}
</style>