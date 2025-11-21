// pages/income/income.js
const app = getApp();

Page({
  data: {
    income: '',
    canProceed: false
  },

  onLoad() {
    // 如果之前已经设置过收入，显示出来
    if (app.globalData.monthlyIncome > 0) {
      this.setData({
        income: app.globalData.monthlyIncome.toString(),
        canProceed: true
      });
    }
  },

  onIncomeInput(e) {
    const value = e.detail.value;
    const income = parseFloat(value);

    this.setData({
      income: value,
      canProceed: income > 0
    });
  },

  nextStep() {
    if (!this.data.canProceed) {
      wx.showToast({
        title: '请输入有效的月收入',
        icon: 'none'
      });
      return;
    }

    const income = parseFloat(this.data.income);

    // 保存到全局数据
    app.globalData.monthlyIncome = income;
    app.saveData();

    // 跳转到分配比例页面
    wx.navigateTo({
      url: '/pages/allocation/allocation'
    });
  }
})
