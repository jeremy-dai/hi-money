// pages/welcome/welcome.js
Page({
  data: {},

  onLoad() {
    // 检查是否已完成设置
    const app = getApp();
    if (app.globalData.hasCompletedSetup) {
      // 如果已完成设置，直接跳转到仪表盘
      wx.redirectTo({
        url: '/pages/dashboard/dashboard'
      });
    }
  },

  startJourney() {
    wx.navigateTo({
      url: '/pages/income/income'
    });
  }
})
