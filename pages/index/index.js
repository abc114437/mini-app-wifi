//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    wifiList: []
  },
  onLoad() {
    this.startWifi()
  },
  getWifi() {
    this.getWifiList()
      .then(() => this.onGetWifiList())
    // setTimeout(() => {
    //   this.data.wifi.status === 'connect' && this.connectedFail()
    // }, 3000)
    // const SSID = Promise.race([this.onWifiConnected(), this.onNetworkStatusChange(), this.listenNetworkChange()])
    // this.connectedSuccess(SSID)
  },
  startWifi() {
    return new Promise((resolve, reject) => {
      wx.startWifi({
        success() {
          resolve()
        },
        complete(r) {
          reject(r)
        }
      })
    })
  },
  getWifiList() {
    return new Promise(resolve => {
      wx.getWifiList({
        success() {
          resolve()
        }
      })
    })
  },
  onGetWifiList() {
    return new Promise(resolve => {
      wx.onGetWifiList(res => {
        console.log(res.wifiList)
        this.setData({
          wifiList: res.wifiList
        })
      })
    })
  },
  connectWifi({ SSID, BSSID, password } = this.shopWifi) {
    return new Promise((resolve, reject) => {
      if (!SSID) {
        const r = { errCode: -1 }
        return reject(r)
      }
      wx.connectWifi({
        SSID,
        BSSID,
        password,
        success() {
          resolve()
        },
        complete(r) {
          reject(r)
        }
      })
    })
  },
  onWifiConnected() {
    return new Promise((resolve) => {
      wx.onWifiConnected((res) => {
        console.warn('onWifiConnected', res)
        if (res && res.wifi && res.wifi.SSID) {
          resolve(res.wifi.SSID)
        }
      })
    })
  },
  getConnectedWifi() {
    return new Promise((resolve, reject) => {
      wx.getConnectedWifi({
        success(res) {
          console.log(res)
          if (res && res.wifi && res.wifi.SSID) {
            resolve(res.wifi.SSID)
          }
        },
        complete(r) {
          reject(r)
        }
      })
    })
  },
  listenNetworkChange() {
    return new Promise((resolve) => {
      const self = this
      self.timer = setInterval(() => {
        wx.getNetworkType({
          success(res) {
            console.warn(res)
            if (res.networkType === 'wifi') {
              clearInterval(self.timer)
              resolve(self.getConnectedWifi())
            }
          }
        })
      }, 100)
    })
  },
  onNetworkStatusChange() {
    return new Promise((resolve) => {
      wx.onNetworkStatusChange((res) => {
        console.warn(res)
        if (res.networkType === 'wifi') {
          resolve(this.getConnectedWifi())
        }
      })
    })
  },
  connectedSuccess(SSID = '') {
    const wifi = { ...StatusList[1] }
    wifi.desc += SSID
    this.setData({
      wifi,
      countDown: 3
    })

    this.countDown(2)
  },
  connectedFail(errMsg) {
    const wifi = { ...StatusList[2] }
    errMsg && (wifi.desc = errMsg)
    this.setData({
      wifi,
      connectedWifi: this.shopWifi
    })
  },
  errorHandle(e = {}) {
    let errMsg
    switch (e.errCode) {
      case 12005:
        errMsg = '请打开 Wi-Fi 开关后，重新扫码'
        break
      case 12006:
        errMsg = '请开启GPS 定位后，重新扫码'
        break
      case -1:
        errMsg = '连接失败，请咨询店员'
        break
      default:
    }
    this.connectedFail(errMsg)
  },
})
