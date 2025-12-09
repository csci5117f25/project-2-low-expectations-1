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
          <Button label="-" @click="decreaseBet" :disabled="spinning" />
          <div class="bet-amount">
            <span class="label">Bet:</span>
            <span class="amount">${{ currentBet.toFixed(2) }}</span>
          </div>
          <Button label="+" @click="increaseBet" :disabled="spinning" />
        </div>

        <Button 
          :label="spinning ? 'SPINNING...' : 'SPIN'" 
          @click="spin" 
          :disabled="spinning || balance < currentBet"
          severity="danger"
          size="large"
          class="spin-button"
        />

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

// Three.js variables
let scene, camera, renderer, slotMachine, loadedModel;
let reels = [];
const symbols = ['🍒', '🍋', '🍊', '🔔', '⭐', '7️⃣'];
let modelLoaded = false;

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
});

function initThreeJS() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0a0a);
  
  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 15);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvasContainer.value.appendChild(renderer.domElement);
  
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
  
  // Camera animation - zoom into slot machine
  animateCamera();
  
  // Window resize handler
  window.addEventListener('resize', onWindowResize);
  
  // Start animation loop
  animate();
}

function createCasinoEnvironment() {
  // Floor
  const floorGeometry = new THREE.PlaneGeometry(50, 50);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2a1a1a,
    roughness: 0.8
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -5;
  scene.add(floor);
  
  // Back wall
  const wallGeometry = new THREE.PlaneGeometry(50, 20);
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a0505
  });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.z = -10;
  scene.add(wall);
  
  // Decorative lights
  for (let i = 0; i < 10; i++) {
    const lightBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff0000 : 0xffff00 })
    );
    lightBulb.position.set(
      (Math.random() - 0.5) * 20,
      5 + Math.random() * 3,
      -9
    );
    scene.add(lightBulb);
  }
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
      
      // Adjust scale and position - tweak these based on your model
      slotMachine.scale.set(10, 10, 10);
      slotMachine.position.set(0, -8, 3);
      slotMachine.rotation.y = 0;
      
      scene.add(slotMachine);
      modelLoaded = true;
      
      // Log model structure
      console.log('✅ Slot machine loaded successfully!');
      console.log('Model structure:');
      loadedModel.traverse((child) => {
        if (child.name) {
          console.log(`  - ${child.name} (${child.type})`);
        }
      });
      
      // Create overlay reels for spinning functionality
      createOverlayReels();
    },
    (xhr) => {
      const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
      console.log(`Loading model: ${percent}%`);
    },
    (error) => {
      console.error('❌ Error loading GLB model:', error);
      console.log('Falling back to placeholder slot machine');
      createFallbackSlotMachine();
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
        
        // Position the 4 slots side by side
        // Adjust these values based on your model's size and desired spacing
        slotReel.position.set((i - 1.45) * 1.5, .5, 5);
        slotReel.scale.set(10, 10, 10);
        
        scene.add(slotReel);
        
        reels.push({
          group: slotReel,
          targetRotation: 0,
          currentRotation: 0,
          symbolIndex: 0,
          spinning: false
        });
        
        console.log(`✅ Slot reel ${i + 1} loaded`);
      },
      (xhr) => {
        console.log(`Slot ${i + 1}: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
      },
      (error) => {
        console.error(`Error loading slot ${i + 1}:`, error);
        // Fallback to overlay reel if slot.glb fails
        const fallbackReel = createReel(i - 1.5);
        fallbackReel.position.set((i - 1.5) * 2.2, 1, 5);
        scene.add(fallbackReel);
        reels.push({
          group: fallbackReel,
          targetRotation: 0,
          currentRotation: 0,
          symbolIndex: 0,
          spinning: false
        });
      }
    );
  }
  
  console.log('✅ Loading 4 individual slot reels...');
}

function createFallbackSlotMachine() {
  slotMachine = new THREE.Group();
  
  // Machine body
  const bodyGeometry = new THREE.BoxGeometry(8, 10, 3);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xcc0000,
    metalness: 0.6,
    roughness: 0.4
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  slotMachine.add(body);
  
  // Screen area
  const screenGeometry = new THREE.BoxGeometry(7, 4, 0.5);
  const screenMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x000000,
    emissive: 0x001100
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 1, 1.6);
  slotMachine.add(screen);
  
  // Create 3 reels
  for (let i = 0; i < 3; i++) {
    const reel = createReel(i - 1);
    slotMachine.add(reel);
    reels.push({
      group: reel,
      targetRotation: 0,
      currentRotation: 0,
      symbolIndex: 0,
      spinning: false
    });
  }
  
  // Top decoration
  const topGeometry = new THREE.BoxGeometry(8.5, 1, 3.5);
  const topMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffd700,
    metalness: 0.8,
    roughness: 0.2
  });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = 5.5;
  slotMachine.add(top);
  
  // Lever
  const leverGroup = new THREE.Group();
  const handleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3);
  const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const handle = new THREE.Mesh(handleGeometry, handleMaterial);
  leverGroup.add(handle);
  
  const ballGeometry = new THREE.SphereGeometry(0.4);
  const ball = new THREE.Mesh(ballGeometry, handleMaterial);
  ball.position.y = 1.5;
  leverGroup.add(ball);
  
  leverGroup.position.set(4.5, 2, 0);
  leverGroup.rotation.z = -Math.PI / 6;
  slotMachine.add(leverGroup);
  
  slotMachine.position.y = 0;
  scene.add(slotMachine);
  modelLoaded = true;
}

function createReel(xPosition) {
  const reelGroup = new THREE.Group();
  
  // Reel cylinder
  const cylinderGeometry = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
  const cylinderMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    metalness: 0.3,
    roughness: 0.7
  });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.rotation.z = Math.PI / 2;
  reelGroup.add(cylinder);
  
  // Add symbols around the cylinder
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
  
  reelGroup.position.set(xPosition * 2.2, 1, 1.8);
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

function animateCamera() {
  const startPos = { x: 0, y: 5, z: 30 };
  const endPos = { x: 0, y: 0, z: 15 };
  const duration = 2000;
  const startTime = Date.now();
  
  function updateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    
    camera.position.x = startPos.x + (endPos.x - startPos.x) * eased;
    camera.position.y = startPos.y + (endPos.y - startPos.y) * eased;
    camera.position.z = startPos.z + (endPos.z - startPos.z) * eased;
    camera.lookAt(0, 0, 0);
    
    if (progress < 1) {
      requestAnimationFrame(updateCamera);
    }
  }
  
  updateCamera();
}

function animate() {
  requestAnimationFrame(animate);
  
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
  
  // Gentle machine wobble
  if (slotMachine && modelLoaded) {
    slotMachine.rotation.y = Math.sin(Date.now() * 0.0005) * 0.02;
  }
  
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
  
  // Spin each reel with different speeds (now 4 reels)
  reels.forEach((reel, index) => {
    const spins = 5 + index;
    const randomSymbol = Math.floor(Math.random() * symbols.length);
    const anglePerSymbol = (Math.PI * 2) / symbols.length;
    
    reel.targetRotation = reel.currentRotation + (spins * Math.PI * 2) + (randomSymbol * anglePerSymbol);
    reel.symbolIndex = randomSymbol;
    reel.spinning = true;
  });
  
  // Check results after all reels stop
  setTimeout(() => {
    checkWin();
    spinning.value = false;
  }, 3000 + (reels.length * 300));
}

function checkWin() {
  const results = reels.map(r => r.symbolIndex);
  
  // Check for matches with 4 reels
  if (results[0] === results[1] && results[1] === results[2] && results[2] === results[3]) {
    // Four of a kind - JACKPOT!
    const multiplier = results[0] === 5 ? 100 : results[0] === 4 ? 50 : 25; // 7s, stars, bells
    lastWin.value = currentBet.value * multiplier;
    balance.value += lastWin.value;
  } else if (results[0] === results[1] && results[1] === results[2]) {
    // Three of a kind
    const multiplier = results[0] === 5 ? 50 : results[0] === 4 ? 20 : 10;
    lastWin.value = currentBet.value * multiplier;
    balance.value += lastWin.value;
  } else if (results[1] === results[2] && results[2] === results[3]) {
    // Three of a kind (last three)
    const multiplier = results[1] === 5 ? 50 : results[1] === 4 ? 20 : 10;
    lastWin.value = currentBet.value * multiplier;
    balance.value += lastWin.value;
  } else if (results[0] === results[1] || results[1] === results[2] || results[2] === results[3]) {
    // Two of a kind
    lastWin.value = currentBet.value * 2;
    balance.value += lastWin.value;
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
}

.slot-ui {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  z-index: 10;
}

.slot-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
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

.spin-button {
  font-size: 1.5rem;
  padding: 1rem 3rem;
  font-weight: bold;
  letter-spacing: 2px;
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
  
  .spin-button {
    width: 100%;
  }
}
</style>