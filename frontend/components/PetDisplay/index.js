import { createStoreBindings } from 'mobx-miniprogram-bindings'
import store from '../../store/index'

Component({
  properties: {
    pet: {
      type: Object,
      value: null
    },
    size: {
      type: String,
      value: 'medium'
    },
    interactive: {
      type: Boolean,
      value: true
    }
  },

  data: {
    canvasId: 'pet-canvas',
    scene: null,
    camera: null,
    renderer: null,
    petModel: null,
    animationMixer: null
  },

  lifetimes: {
    attached() {
      this.storeBindings = createStoreBindings(this, {
        store: store.petStore,
        fields: ['currentPet'],
        actions: ['interactWithPet']
      })
      this.initThreeJS()
    },

    detached() {
      this.storeBindings.destroyStoreBindings()
      this.cleanup()
    }
  },

  methods: {
    initThreeJS() {
      const canvas = this.selectComponent('#pet-canvas')
      if (!canvas) return

      const THREE = require('threejs-miniprogram')
      
      this.data.scene = new THREE.Scene()
      this.data.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
      this.data.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      
      this.data.renderer.setSize(300, 300)
      this.data.renderer.setClearColor(0xffffff, 0)
      
      this.data.camera.position.z = 5
      
      this.loadPetModel()
      this.animate()
    },

    loadPetModel() {
      const pet = this.properties.pet || this.data.currentPet
      if (!pet) return

      const THREE = require('threejs-miniprogram')
      const loader = new THREE.GLTFLoader()
      
      loader.load(pet.modelUrl || '/assets/models/default-pet.glb', (gltf) => {
        this.data.petModel = gltf.scene
        this.data.scene.add(this.data.petModel)
        
        if (gltf.animations && gltf.animations.length > 0) {
          this.data.animationMixer = new THREE.AnimationMixer(this.data.petModel)
          const idleAction = this.data.animationMixer.clipAction(gltf.animations[0])
          idleAction.play()
        }
        
        this.updatePetAppearance()
      })
    },

    updatePetAppearance() {
      const pet = this.properties.pet || this.data.currentPet
      if (!pet || !this.data.petModel) return

      const avgStatus = (pet.mood + pet.hunger + pet.cleanliness) / 3
      let scale = 1
      let color = 0xffffff

      if (avgStatus >= 80) {
        scale = 1.1
        color = 0x90EE90
      } else if (avgStatus >= 60) {
        scale = 1.05
        color = 0xFFFFE0
      } else if (avgStatus >= 40) {
        scale = 1.0
        color = 0xFFE4B5
      } else {
        scale = 0.95
        color = 0xFFB6C1
      }

      this.data.petModel.scale.set(scale, scale, scale)
      
      this.data.petModel.traverse((child) => {
        if (child.isMesh) {
          child.material.color.setHex(color)
        }
      })
    },

    animate() {
      if (this.data.animationMixer) {
        this.data.animationMixer.update(0.016)
      }
      
      if (this.data.petModel) {
        this.data.petModel.rotation.y += 0.01
      }
      
      this.data.renderer.render(this.data.scene, this.data.camera)
      requestAnimationFrame(() => this.animate())
    },

    onTouchStart(e) {
      if (!this.properties.interactive) return
      
      const pet = this.properties.pet || this.data.currentPet
      if (!pet) return

      this.triggerEvent('pettouch', { pet, touch: e.touches[0] })
      
      if (this.data.petModel) {
        this.playAnimation('happy')
      }
    },

    playAnimation(animationType) {
      if (!this.data.animationMixer || !this.data.petModel) return

      const animations = {
        'happy': 'Happy',
        'eat': 'Eating',
        'sleep': 'Sleeping',
        'play': 'Playing'
      }

      const animationName = animations[animationType]
      if (animationName) {
        const action = this.data.animationMixer.clipAction(animationName)
        action.reset().play()
        
        setTimeout(() => {
          action.fadeOut(0.5)
        }, 2000)
      }
    },

    cleanup() {
      if (this.data.animationMixer) {
        this.data.animationMixer.stopAllAction()
      }
      
      if (this.data.scene) {
        this.data.scene.clear()
      }
      
      if (this.data.renderer) {
        this.data.renderer.dispose()
      }
    }
  }
})
