import { observable, action } from 'mobx-miniprogram'
import PetService from '../services/pet.service'

export default class PetStore {
  constructor(rootStore) {
    this.rootStore = rootStore
    this.statusDecayTimer = null
  }

  @observable currentPet = null
  @observable petList = []
  @observable isGenerating = false
  @observable lastInteractionTime = null

  @action
  setCurrentPet(pet) {
    this.currentPet = pet
    this.lastInteractionTime = Date.now()
  }

  @action
  setPetList(pets) {
    this.petList = pets
  }

  @action
  async generatePet(imageUrl, petName) {
    try {
      this.isGenerating = true
      this.rootStore.uiStore.setLoading(true)
      const response = await PetService.generatePet(imageUrl, petName)
      this.setCurrentPet(response.pet)
      return response
    } catch (error) {
      console.error('Generate pet failed:', error)
      throw error
    } finally {
      this.isGenerating = false
      this.rootStore.uiStore.setLoading(false)
    }
  }

  @action
  async getPetList() {
    try {
      const response = await PetService.getPetList()
      this.setPetList(response.pets)
      return response
    } catch (error) {
      console.error('Get pet list failed:', error)
      throw error
    }
  }

  @action
  async interactWithPet(interactionType) {
    if (!this.currentPet) return

    try {
      const response = await PetService.interactWithPet(this.currentPet.id, interactionType)
      this.updatePetStatus(response.pet)
      this.lastInteractionTime = Date.now()
      return response
    } catch (error) {
      console.error('Pet interaction failed:', error)
      throw error
    }
  }

  @action
  updatePetStatus(petData) {
    if (this.currentPet && this.currentPet.id === petData.id) {
      this.currentPet = { ...this.currentPet, ...petData }
    }
  }

  @action
  startStatusDecay() {
    if (this.statusDecayTimer) return

    this.statusDecayTimer = setInterval(() => {
      if (this.currentPet) {
        this.decayPetStatus()
      }
    }, 60000)
  }

  @action
  stopStatusDecay() {
    if (this.statusDecayTimer) {
      clearInterval(this.statusDecayTimer)
      this.statusDecayTimer = null
    }
  }

  @action
  decayPetStatus() {
    if (!this.currentPet) return

    const now = Date.now()
    const timeSinceLastInteraction = now - (this.lastInteractionTime || now)
    const hoursElapsed = timeSinceLastInteraction / (1000 * 60 * 60)

    if (hoursElapsed >= 1) {
      const decayAmount = Math.floor(hoursElapsed)
      this.currentPet.mood = Math.max(0, this.currentPet.mood - decayAmount)
      this.currentPet.hunger = Math.max(0, this.currentPet.hunger - decayAmount * 2)
      this.currentPet.cleanliness = Math.max(0, this.currentPet.cleanliness - decayAmount)
      this.lastInteractionTime = now
    }
  }

  get petStatusColor() {
    if (!this.currentPet) return '#999999'
    
    const avgStatus = (this.currentPet.mood + this.currentPet.hunger + this.currentPet.cleanliness) / 3
    if (avgStatus >= 80) return '#52C41A'
    if (avgStatus >= 60) return '#FAAD14'
    if (avgStatus >= 40) return '#FF9966'
    return '#FF4D4F'
  }

  get petStatusText() {
    if (!this.currentPet) return '未知'
    
    const avgStatus = (this.currentPet.mood + this.currentPet.hunger + this.currentPet.cleanliness) / 3
    if (avgStatus >= 80) return '非常开心'
    if (avgStatus >= 60) return '开心'
    if (avgStatus >= 40) return '一般'
    return '不开心'
  }
}
