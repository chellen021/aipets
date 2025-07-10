import { observable } from 'mobx-miniprogram'
import UserStore from './user.store'
import PetStore from './pet.store'
import UIStore from './ui.store'

class RootStore {
  constructor() {
    this.userStore = new UserStore(this)
    this.petStore = new PetStore(this)
    this.uiStore = new UIStore(this)
  }
}

export default new RootStore()
