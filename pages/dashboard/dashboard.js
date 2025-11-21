// pages/dashboard/dashboard.js
const app = getApp();

Page({
  data: {
    currentMonth: '',
    allocation: {
      growth: 25,
      stability: 15,
      essentials: 50,
      rewards: 10
    },
    amounts: {
      growth: '0.00',
      stability: '0.00',
      essentials: '0.00',
      rewards: '0.00'
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
    const allocation = app.globalData.allocation;

    // 获取各类别实际金额（从账户计算）
    const amounts = {
      growth: app.getCategoryTotal('growth').toFixed(2),
      stability: app.getCategoryTotal('stability').toFixed(2),
      essentials: app.getCategoryTotal('essentials').toFixed(2),
      rewards: app.getCategoryTotal('rewards').toFixed(2)
    };

    // 获取目标和总资产
    const goalName = app.globalData.goal.name || '未设置目标';
    const goalAmount = app.globalData.goal.totalAmount || 0;
    const totalAssets = app.getTotalAssets();

    this.setData({
      currentMonth,
      allocation,
      amounts,
      goalName,
      goalAmount,
      totalAssets
    });
  },

  drawPieChart() {
    const ctx = wx.createCanvasContext('pieChart', this);
    const { allocation } = this.data;

    // 画布尺寸
    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    // 数据和颜色 - 按照25-15-50-10顺序
    const data = [
      { value: allocation.growth, color: '#10B981' },       // 增长投资 - 绿色
      { value: allocation.stability, color: '#3B82F6' },    // 稳定基金 - 蓝色
      { value: allocation.essentials, color: '#F59E0B' },   // 基本开支 - 橙色
      { value: allocation.rewards, color: '#F9A8D4' }       // 奖励消费 - 粉色
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

  // 新增：跳转到目标设定
  goToGoal() {
    wx.navigateTo({
      url: '/pages/goal/goal'
    });
  },

  // 新增：跳转到账户管理
  goToAccounts() {
    wx.navigateTo({
      url: '/pages/accounts/accounts'
    });
  },

  // 新增：跳转到智能分配
  goToAllocateIncome() {
    wx.navigateTo({
      url: '/pages/allocate-income/allocate-income'
    });
  },

  // 新增：跳转到数据分析
  goToAnalytics() {
    wx.navigateTo({
      url: '/pages/analytics/analytics'
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
