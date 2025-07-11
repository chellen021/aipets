import { observable, action } from 'mobx-miniprogram'

export default class UIStore {
  @observable isLoading = false
  @observable loadingText = '加载中...'
  @observable toastMessage = ''
  @observable toastVisible = false
  @observable modalVisible = false
  @observable modalConfig = {}

  @action
  setLoading(loading, text = '加载中...') {
    this.isLoading = loading
    this.loadingText = text
  }

  @action
  showToast(message, duration = 2000) {
    this.toastMessage = message
    this.toastVisible = true
    setTimeout(() => {
      this.hideToast()
    }, duration)
  }

  @action
  hideToast() {
    this.toastVisible = false
    this.toastMessage = ''
  }

  @action
  showModal(config) {
    this.modalConfig = config
    this.modalVisible = true
  }

  @action
  hideModal() {
    this.modalVisible = false
    this.modalConfig = {}
  }
}
