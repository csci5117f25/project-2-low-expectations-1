<template>
  <div class="practice-container">
    <!-- Curtains Overlay -->
    <div class="curtains" :class="{ 'open': curtainsOpen }">
      <div class="curtain curtain-left"></div>
      <div class="curtain curtain-right"></div>
    </div>

    <!-- 3D Canvas -->
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- Slot Machine UI Overlay -->
    <div class="slot-ui" v-if="showUI">
      <div class="slot-controls">
        <div class="balance-display">
          <span class="label">Balance:</span>
          <span class="amount">${{ balance.toFixed(2) }}</span>
        </div>
        
        <div class="bet-controls">
          <Button label="-" @click="decreaseBet" :disabled="spinning || leverPulling" />
          <div class="bet-amount">
            <span class="label">Bet:</span>
            <span class="amount">${{ currentBet.toFixed(2) }}</span>
          </div>
          <Button label="+" @click="increaseBet" :disabled="spinning || leverPulling" />
        </div>

        <div class="lever-instruction" v-if="!spinning && !leverPulling">
          <span class="instruction-text">👆 Pull the lever to spin!</span>
        </div>

        <div class="last-win" v-if="lastWin > 0">
          <span class="win-label">Last Win:</span>
          <span class="win-amount">${{ lastWin.toFixed(2) }}</span>
        </div>
      </div>

      <Button 
        label="← Back to Dashboard" 
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

// Game state
const balance = ref(100.00);
const currentBet = ref(1.00);
const lastWin = ref(0);
const spinning = ref(false);
const leverPulling = ref(false);

// Three.js variables
let scene, camera, renderer, slotMachine, loadedModel, leverModel, casino;
let reels = [];
const symbols = ['🍒', '7️⃣', '🔔', '🍊', '🍇'];
let modelLoaded = false;
let leverLoaded = false;

// Lever interaction
let isDraggingLever = false;
let leverPullProgress = 0;
let leverRestRotation = 0;
const maxLeverRotation = Math.PI / 3; // 60 degrees pull

// Camera positions
const cameraZoomedOut = { x: 0, y: 2, z: 25 };
const cameraZoomedIn = { x: 0, y: 0, z: 15 };

// Raycaster for lever interaction
let raycaster, mouse;

onMounted(() => {
  // Start curtain animation
  setTimeout(() => {
    curtainsOpen.value = true;
    setTimeout(() => {
      initThreeJS();
      showUI.value = true;
    }, 1000);
  }, 500);
});

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
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0a0a);
  
  // Camera - start zoomed out
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(cameraZoomedOut.x, cameraZoomedOut.y, cameraZoomedOut.z);
  camera.lookAt(0, 0, 0);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvasContainer.value.appendChild(renderer.domElement);
  
  // Raycaster for mouse interaction
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  
  // Lighting
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
  
  // Front light to illuminate the machine
  const frontLight = new THREE.DirectionalLight(0xffffff, 1.2);
  frontLight.position.set(0, 5, 20);
  frontLight.target.position.set(0, 0, 0);
  scene.add(frontLight);
  scene.add(frontLight.target);
  
  // Create casino environment
  createCasinoEnvironment();
  
  // Load 3D slot machine model
  loadSlotMachineGLB();
  
  // Window resize handler
  window.addEventListener('resize', onWindowResize);
  
  // Mouse/touch event listeners
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchstart', onTouchStart);
  window.addEventListener('touchmove', onTouchMove);
  window.addEventListener('touchend', onTouchEnd);
  
  // Start animation loop
  animate();
}

function createCasinoEnvironment() {
  // Casino Scene
  const loader = new GLTFLoader();

  console.log('Loading casino scene from /models/gameready_casino_scene.glb...');

  loader.load(
    '/models/gameready_casino_scene.glb',
    (gltf) => {
      loadedModel = gltf.scene;
      casino = new THREE.Group();
      
      // Add the loaded model to the Casino group
      casino.add(loadedModel);
      
      // Adjust scale and position
      casino.scale.set(.2, .2, .2);
      casino.position.set(0, -7, 5);
      casino.rotation.y = Math.PI/2; // Rotate 180 degrees to face camera
      
      scene.add(casino);
      modelLoaded = true;
      
      console.log('✅ Casino loaded successfully!');
    },
    (xhr) => {
      const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
      console.log(`Loading model: ${percent}%`);
    },
    (error) => {
      console.error('❌ Error loading GLB model:', error);
    }
  );
}

function loadSlotMachineGLB() {
  const loader = new GLTFLoader();
  
  console.log('Loading slot machine model from /models/slot_machine.glb...');
  
  loader.load(
    '/models/slot_machine.glb',
    (gltf) => {
      loadedModel = gltf.scene;
      slotMachine = new THREE.Group();
      
      // Add the loaded model to the slot machine group
      slotMachine.add(loadedModel);
      
      // Adjust scale and position
      slotMachine.scale.set(10, 10, 10);
      slotMachine.position.set(0, -8, 3);
      slotMachine.rotation.y = 0;
      
      scene.add(slotMachine);
      modelLoaded = true;
      
      console.log('✅ Slot machine loaded successfully!');
      
      // Load lever
      loadLever();
      
      // Create overlay reels as children of slot machine
      createOverlayReels();
    },
    (xhr) => {
      const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
      console.log(`Loading model: ${percent}%`);
    },
    (error) => {
      console.error('❌ Error loading GLB model:', error);
    }
  );
}

function loadLever() {
  const loader = new GLTFLoader();
  
  console.log('Loading lever from /models/lever.glb...');
  
  loader.load(
    '/models/lever.glb',
    (gltf) => {
      leverModel = gltf.scene;
      leverModel.name = 'lever';
      
      // Position and scale lever relative to slot machine
      leverModel.scale.set(1, 1, 1);
      leverModel.position.set(0.56, .8, 0); // Adjust based on your model
      
      // Store the initial rotation
      leverRestRotation = leverModel.rotation.x;
      
      // Add lever as child of slot machine so it moves with it
      slotMachine.add(leverModel);
      leverLoaded = true;
      
      console.log('✅ Lever loaded successfully!');
    },
    (xhr) => {
      console.log(`Lever: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
    },
    (error) => {
      console.error('❌ Error loading lever:', error);
    }
  );
}

function createOverlayReels() {
  console.log('Creating individual spinning slot reels...');
  
  const slotLoader = new GLTFLoader();
  
  for (let i = 0; i < 4; i++) {
    slotLoader.load(
      '/models/slot.glb',
      (gltf) => {
        const slotReel = gltf.scene.clone();
        
        // Position the 4 slots as children of slot machine (in local space)
        // Since slotMachine has scale of 10, we need to compensate in local coordinates
        slotReel.position.set((i - 1.45) * .15, .85, .2);
        slotReel.scale.set(1, 1, 1);
        
        // Add as child of slot machine so they move together
        slotMachine.add(slotReel);
        
        reels.push({
          group: slotReel,
          targetRotation: 0,
          currentRotation: 0,
          symbolIndex: 0,
          spinning: false
        });
        
        console.log(`✅ Slot reel ${i + 1} loaded at position:`, slotReel.position);
      },
      undefined,
      (error) => {
        console.error(`Error loading slot ${i + 1}:`, error);
      }
    );
  }
}

function createReel(xPosition) {
  const reelGroup = new THREE.Group();
  
  const cylinderGeometry = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
  const cylinderMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    metalness: 0.3,
    roughness: 0.7
  });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.rotation.z = Math.PI / 2;
  reelGroup.add(cylinder);
  
  const numSymbols = symbols.length;
  for (let i = 0; i < numSymbols; i++) {
    const angle = (i / numSymbols) * Math.PI * 2;
    const symbolMesh = createSymbolMesh(symbols[i]);
    symbolMesh.position.set(
      Math.sin(angle) * 0.85,
      0,
      Math.cos(angle) * 0.85
    );
    symbolMesh.rotation.y = -angle;
    reelGroup.add(symbolMesh);
  }
  
  reelGroup.position.set(xPosition, 1, 1.8);
  return reelGroup;
}

function createSymbolMesh(symbol) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, 64, 64);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true
  });
  const geometry = new THREE.PlaneGeometry(0.8, 0.8);
  return new THREE.Mesh(geometry, material);
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
  if (balance.value < currentBet.value) return;
  
  // Zoom camera in
  animateCameraZoom();
  
  // Start spin after camera zoom
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
  
  // Update lever rotation based on pull progress
  if (leverModel && leverLoaded) {
    leverModel.rotation.x = leverRestRotation + (leverPullProgress * maxLeverRotation);
  }
  
  // Update spinning reels
  reels.forEach(reel => {
    if (reel.spinning) {
      reel.currentRotation += 0.3;
      reel.group.rotation.x = reel.currentRotation;
      
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

function spin() {
  if (spinning.value || balance.value < currentBet.value) return;
  
  spinning.value = true;
  balance.value -= currentBet.value;
  lastWin.value = 0;
  
  // Spin each reel - land on one of 5 evenly split symbols
  reels.forEach((reel, index) => {
    const spins = 5 + index;
    const randomSymbol = Math.floor(Math.random() * symbols.length);
    const anglePerSymbol = (Math.PI * 2) / symbols.length;
    
    // Calculate exact landing position for chosen symbol
    reel.targetRotation = reel.currentRotation + (spins * Math.PI * 2) + (randomSymbol * anglePerSymbol);
    reel.symbolIndex = randomSymbol;
    reel.spinning = true;
  });
  
  // Check results after all reels stop
  setTimeout(() => {
    checkWin();
    spinning.value = false;
    
    // Zoom camera back out
    zoomCameraOut();
  }, 3000 + (reels.length * 300));
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

function checkWin() {
  const results = reels.map(r => r.symbolIndex);
  const resultSymbols = results.map(i => symbols[i]);
  
  // Console log what each wheel landed on
  console.log('🎰 SPIN RESULTS:');
  reels.forEach((reel, index) => {
    console.log(`  Wheel ${index + 1}: ${symbols[reel.symbolIndex]} (index: ${reel.symbolIndex})`);
  });
  console.log(`  Full result: [${resultSymbols.join(', ')}]`);
  
  // Check for matches with 4 reels
  if (results[0] === results[1] && results[1] === results[2] && results[2] === results[3]) {
    // Four of a kind - JACKPOT!
    const multiplier = results[0] === 4 ? 100 : results[0] === 3 ? 50 : 25;
    lastWin.value = currentBet.value * multiplier;
    balance.value += lastWin.value;
    console.log(`🎉 FOUR OF A KIND! Win: $${lastWin.value.toFixed(2)}`);
  } else if (results[0] === results[1] && results[1] === results[2]) {
    // Three of a kind (first three)
    const multiplier = results[0] === 4 ? 50 : results[0] === 3 ? 20 : 10;
    lastWin.value = currentBet.value * multiplier;
    balance.value += lastWin.value;
    console.log(`🎊 THREE OF A KIND! Win: $${lastWin.value.toFixed(2)}`);
  } else if (results[1] === results[2] && results[2] === results[3]) {
    // Three of a kind (last three)
    const multiplier = results[1] === 4 ? 50 : results[1] === 3 ? 20 : 10;
    lastWin.value = currentBet.value * multiplier;
    balance.value += lastWin.value;
    console.log(`🎊 THREE OF A KIND! Win: $${lastWin.value.toFixed(2)}`);
  } else if (results[0] === results[1] || results[1] === results[2] || results[2] === results[3]) {
    // Two of a kind
    lastWin.value = currentBet.value * 2;
    balance.value += lastWin.value;
    console.log(`💰 TWO OF A KIND! Win: $${lastWin.value.toFixed(2)}`);
  } else {
    console.log('❌ No win this time');
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
.bet-amount,
.last-win {
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
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
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
}

@media (max-width: 768px) {
  .slot-controls {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .instruction-text {
    font-size: 1rem;
  }
}
</style>