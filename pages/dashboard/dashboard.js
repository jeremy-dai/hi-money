// pages/dashboard/dashboard.js
const app = getApp();

Page({
  data: {
    currentMonth: '',
    allocation: {
      living: 50,
      investment: 25,
      stable: 15,
      fun: 10
    },
    amounts: {
      living: '0.00',
      investment: '0.00',
      stable: '0.00',
      fun: '0.00'
    }
  },

  onLoad() {
    // 检查是否已完成设置
    if (!app.globalData.hasCompletedSetup) {
      wx.redirectTo({
        url: '/pages/welcome/welcome'
      });
      return;
    }

    this.loadData();
    this.drawPieChart();
  },

  loadData() {
    // 获取当前月份
    const date = new Date();
    const monthNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
    const currentMonth = monthNames[date.getMonth()];

    // 加载数据
    const income = app.globalData.monthlyIncome;
    const allocation = app.globalData.allocation;

    // 计算各类别金额
    const amounts = {
      living: ((income * allocation.living) / 100).toFixed(2),
      investment: ((income * allocation.investment) / 100).toFixed(2),
      stable: ((income * allocation.stable) / 100).toFixed(2),
      fun: ((income * allocation.fun) / 100).toFixed(2)
    };

    this.setData({
      currentMonth,
      allocation,
      amounts
    });
  },

  drawPieChart() {
    const ctx = wx.createCanvasContext('pieChart', this);
    const { allocation } = this.data;

    // 画布尺寸
    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    // 数据和颜色
    const data = [
      { value: allocation.living, color: '#FFD93D' },
      { value: allocation.investment, color: '#6BCB77' },
      { value: allocation.stable, color: '#4D96FF' },
      { value: allocation.fun, color: '#FFB6C1' }
    ];

    // 绘制饼图
    let startAngle = -Math.PI / 2;

    data.forEach(item => {
      const angle = (item.value / 100) * 2 * Math.PI;
      const endAngle = startAngle + angle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.setFillStyle(item.color);
      ctx.fill();

      startAngle = endAngle;
    });

    // 绘制中心白色圆形（形成环形图）
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.setFillStyle('#FFFFFF');
    ctx.fill();

    ctx.draw();
  },

  showDetail(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/detail/detail?type=${type}`
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/allocation/allocation'
    });
  },

  onShow() {
    // 每次显示页面时重新加载数据
    if (app.globalData.hasCompletedSetup) {
      this.loadData();
      this.drawPieChart();
    }
  }
})
