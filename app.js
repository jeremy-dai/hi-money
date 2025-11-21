// app.js
App({
  globalData: {
    monthlyIncome: 0,
    allocation: {
      growth: 25,      // 增长投资 (Growth)
      stability: 15,   // 稳定基金 (Stability)
      essentials: 50,  // 基本开支 (Essentials)
      rewards: 10      // 奖励消费 (Rewards)
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
