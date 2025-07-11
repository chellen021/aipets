import request from './request'

class PetService {
  async generatePet(imageUrl, petName) {
    return request.post('/pet/generate', { imageUrl, petName })
  }

  async getPetList() {
    return request.get('/pet/list')
  }

  async getPetDetail(petId) {
    return request.get(`/pet/${petId}`)
  }

  async interactWithPet(petId, interactionType) {
    return request.post(`/pet/${petId}/interact`, { interactionType })
  }

  async feedPet(petId, foodId) {
    return request.post(`/pet/${petId}/feed`, { foodId })
  }

  async cleanPet(petId) {
    return request.post(`/pet/${petId}/clean`)
  }

  async playWithPet(petId, gameType) {
    return request.post(`/pet/${petId}/play`, { gameType })
  }

  async trainPet(petId, skillType) {
    return request.post(`/pet/${petId}/train`, { skillType })
  }

  async getPetStatus(petId) {
    return request.get(`/pet/${petId}/status`)
  }
}

export default new PetService()
