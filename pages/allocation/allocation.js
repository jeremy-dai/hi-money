// pages/allocation/allocation.js
const app = getApp();

Page({
  data: {
    allocation: {
      living: 50,
      investment: 25,
      stable: 15,
      fun: 10
    },
    total: 100,
    currentlyChanging: '' // 跟踪当前正在更改的滑块
  },

  onLoad() {
    // 加载已保存的分配比例
    const savedAllocation = app.globalData.allocation;
    if (savedAllocation) {
      this.setData({
        allocation: { ...savedAllocation }
      });
      this.calculateTotal();
    }
  },

  calculateTotal() {
    const { living, investment, stable, fun } = this.data.allocation;
    const total = living + investment + stable + fun;
    this.setData({ total });
  },

  // 自动调整其他滑块以保持总和为100%
  autoAdjust(changedField, newValue) {
    const allocation = { ...this.data.allocation };
    const oldValue = allocation[changedField];
    const diff = newValue - oldValue;

    // 更新当前值
    allocation[changedField] = newValue;

    // 获取其他字段
    const otherFields = ['living', 'investment', 'stable', 'fun'].filter(f => f !== changedField);

    // 计算其他字段的总和
    let othersTotal = otherFields.reduce((sum, field) => sum + allocation[field], 0);

    // 需要分配的剩余百分比
    const remaining = 100 - newValue;

    if (othersTotal > 0 && remaining >= 0) {
      // 按比例调整其他字段
      otherFields.forEach(field => {
        const ratio = allocation[field] / othersTotal;
        allocation[field] = Math.round(remaining * ratio);
      });

      // 修正舍入误差
      const currentTotal = Object.values(allocation).reduce((sum, val) => sum + val, 0);
      if (currentTotal !== 100) {
        const adjust = 100 - currentTotal;
        allocation[otherFields[0]] += adjust;
      }
    }

    // 确保所有值都在0-100范围内
    Object.keys(allocation).forEach(key => {
      allocation[key] = Math.max(0, Math.min(100, allocation[key]));
    });

    this.setData({ allocation });
    this.calculateTotal();
  },

  onLivingChanging(e) {
    this.setData({ currentlyChanging: 'living' });
  },

  onLivingChange(e) {
    this.autoAdjust('living', e.detail.value);
    this.setData({ currentlyChanging: '' });
  },

  onInvestmentChanging(e) {
    this.setData({ currentlyChanging: 'investment' });
  },

  onInvestmentChange(e) {
    this.autoAdjust('investment', e.detail.value);
    this.setData({ currentlyChanging: '' });
  },

  onStableChanging(e) {
    this.setData({ currentlyChanging: 'stable' });
  },

  onStableChange(e) {
    this.autoAdjust('stable', e.detail.value);
    this.setData({ currentlyChanging: '' });
  },

  onFunChanging(e) {
    this.setData({ currentlyChanging: 'fun' });
  },

  onFunChange(e) {
    this.autoAdjust('fun', e.detail.value);
    this.setData({ currentlyChanging: '' });
  },

  completeSetup() {
    if (this.data.total !== 100) {
      wx.showToast({
        title: '请确保总比例为100%',
        icon: 'none'
      });
      return;
    }

    // 保存分配比例
    app.globalData.allocation = { ...this.data.allocation };
    app.globalData.hasCompletedSetup = true;
    app.saveData();

    // 跳转到仪表盘
    wx.redirectTo({
      url: '/pages/dashboard/dashboard'
    });
  }
})
