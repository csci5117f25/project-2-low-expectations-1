<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import LogInButton from '@/components/LogInButton.vue'
import FeatureCard from '@/components/FeatureCard.vue'
import Tag from 'primevue/tag'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const canvasRef = ref(null)
let scene, camera, renderer, animationId, loadedModel

onMounted(() => {
  if (!canvasRef.value) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a0a0a)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 2, 25)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
  })

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const spotLight = new THREE.SpotLight(0xffd700, 1)
  spotLight.position.set(0, 10, 10)
  spotLight.angle = Math.PI / 6
  scene.add(spotLight)

  const pointLight1 = new THREE.PointLight(0xff0000, 0.5)
  pointLight1.position.set(-5, 5, 5)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0x0000ff, 0.5)
  pointLight2.position.set(5, 5, 5)
  scene.add(pointLight2)

  const frontLight = new THREE.DirectionalLight(0xffffff, 1.2)
  frontLight.position.set(0, 5, 20)
  frontLight.target.position.set(0, 0, 0)
  scene.add(frontLight)
  scene.add(frontLight.target)

  const loader = new GLTFLoader()

  loader.load(
    '/models/gameready_casino_scene.glb',
    (gltf) => {
      loadedModel = gltf.scene
      const casino = new THREE.Group()

      loadedModel.traverse((child) => {
        if (child.isMesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((material) => {
            const textureTypes = [
              'map',
              'normalMap',
              'roughnessMap',
              'metalnessMap',
              'aoMap',
              'emissiveMap',
              'bumpMap',
              'displacementMap',
            ]

            textureTypes.forEach((texType) => {
              if (material[texType]) {
                const tex = material[texType]
                tex.generateMipmaps = false
                tex.minFilter = THREE.LinearFilter
                tex.magFilter = THREE.LinearFilter
                tex.wrapS = THREE.ClampToEdgeWrapping
                tex.wrapT = THREE.ClampToEdgeWrapping
                tex.anisotropy = 1
                if (texType === 'map') {
                  tex.colorSpace = THREE.SRGBColorSpace
                }
                tex.needsUpdate = true
              }
            })

            // Simplify material for iOS
            material.needsUpdate = true
          })
        }
      })

      casino.add(loadedModel)
      casino.scale.set(0.2, 0.2, 0.2)
      casino.position.set(10, -7, 0)
      casino.rotation.y = -Math.PI / 2

      scene.add(casino)
      console.log('Casino model loaded successfully')
    },
    (progress) => {
      console.log('Loading:', ((progress.loaded / progress.total) * 100).toFixed(0) + '%')
    },
    (error) => {
      console.error('Error loading casino model:', error)
    },
  )

  let angle = 0
  const animate = () => {
    animationId = requestAnimationFrame(animate)

    angle += 0.0005
    const radius = 30
    camera.position.x = Math.sin(angle) * radius
    camera.position.z = Math.cos(angle) * radius
    camera.position.y = 8
    camera.lookAt(0, 0, 0)

    renderer.render(scene, camera)
  }
  animate()

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (animationId) cancelAnimationFrame(animationId)

  if (renderer) {
    renderer.dispose()
    if (renderer.forceContextLoss) {
      renderer.forceContextLoss()
    }
  }

  scene = null
  camera = null
  renderer = null
  loadedModel = null
})

function handleResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
</script>

<template>
  <div class="landing_page">
    <canvas ref="canvasRef" class="three-bg" />
    <div class="blur-overlay" />

    <div class="content">
      <header class="header">
        <div class="header-left">
          <img src="/playing-cards.png" class="logo" />
          <div class="header-title">
            <h1>Gamblr</h1>
            <p>Track your gambling habits responsibly</p>
          </div>
        </div>
      </header>

      <section class="hero">
        <Tag value="Track Responsibly" severity="secondary" rounded />
        <h2 class="hero-title">Take Control of Your Gambling Habits</h2>
        <p class="hero-content">
          A simple way to understand your gambling patterns, visualize your spending, and make
          informed decisions.
        </p>
        <LogInButton />
      </section>

      <section class="card-grid">
        <FeatureCard
          icon="pi pi-chart-line"
          title="Net Results Over Time"
          description="Track your wins, losses, and cumulative totals with detailed time-series analysis."
        />
        <FeatureCard
          icon="pi pi-filter"
          title="Casino Visit Logging and Filtering"
          description="Log visits, filter by date, casino, and other criteria for detailed tracking."
        />
        <FeatureCard
          icon="pi pi-cog"
          title="Customizable Dashboard"
          description="Personalize your dashboard with widgets that matter most to you."
        />
        <FeatureCard
          icon="pi pi-trophy"
          title="Win/Loss Highlights"
          description="Highlight your most significant wins and losses for better insight."
        />
        <FeatureCard
          icon="pi pi-shopping-cart"
          title="What You Could've Had Instead"
          description="See alternative purchases you could have made with your gambling spend."
        />
        <FeatureCard
          icon="pi pi-calendar"
          title="Calendar Heatmap"
          description="Visualize your gambling activity with a calendar heatmap."
        />
        <FeatureCard
          icon="pi pi-clock"
          title="Recent History"
          description="View your most recent gambling visits and outcomes."
        />
        <FeatureCard
          icon="pi pi-percentage"
          title="Break-Even Probability"
          description="Calculate the probability of breaking even on your bets."
        />
        <FeatureCard
          icon="pi pi-play-circle"
          title="Practice Mode"
          description="Practice spinning in a risk-free environment to hone your skills."
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.landing_page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  overscroll-behavior: none;
  touch-action: pan-x pan-y;
}

.three-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.blur-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
}

.header {
  padding: 12px 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  height: 40px;
  padding: 2px;
  border: 1px solid white;
  border-radius: 8px;
}

.header-title h1 {
  margin: 0;
  font-size: 22px;
}

.header-title p {
  margin: 0;
  color: #ccc;
  font-size: 13px;
}

.hero {
  text-align: center;
  padding: 30px 20px 25px;
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-size: 32px;
  margin: 10px 0;
}

.hero-content {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #ddd;
  font-size: 14px;
  max-width: 550px;
  margin: 12px auto 18px;
  line-height: 1.5;
}

.card-grid {
  max-width: 950px;
  margin: 25px auto;
  display: grid;
  gap: 14px;
  padding: 0 20px 40px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

@media (max-width: 768px) {
  .header {
    padding: 10px 16px;
  }
  .header-left {
    gap: 8px;
  }
  .logo {
    height: 35px;
  }
  .header-title h1 {
    font-size: 20px;
  }
  .header-title p {
    font-size: 12px;
  }
  .hero {
    padding: 25px 16px 20px;
  }
  .hero-title {
    font-size: 26px;
  }
  .hero-content {
    font-size: 13px;
    letter-spacing: 1px;
  }
  .card-grid {
    gap: 12px;
    padding-bottom: 30px;
  }
}
</style>
