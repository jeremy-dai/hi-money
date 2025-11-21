// app.js
App({
  globalData: {
    monthlyIncome: 0,
    allocation: {
      living: 50,      // 生活开支
      investment: 25,  // 投资增长
      stable: 15,      // 稳定基金
      fun: 10          // 快乐基金
    },
    hasCompletedSetup: false
  },

  onLaunch() {
    // 从本地存储恢复数据
    this.loadData();
  },

  // 保存数据到本地存储
  saveData() {
    wx.setStorageSync('monthlyIncome', this.globalData.monthlyIncome);
    wx.setStorageSync('allocation', this.globalData.allocation);
    wx.setStorageSync('hasCompletedSetup', this.globalData.hasCompletedSetup);
  },

  // 从本地存储加载数据
  loadData() {
    const income = wx.getStorageSync('monthlyIncome');
    const allocation = wx.getStorageSync('allocation');
    const hasCompleted = wx.getStorageSync('hasCompletedSetup');

    if (income) this.globalData.monthlyIncome = income;
    if (allocation) this.globalData.allocation = allocation;
    if (hasCompleted) this.globalData.hasCompletedSetup = hasCompleted;
  }
})
