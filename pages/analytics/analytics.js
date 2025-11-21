// pages/analytics/analytics.js
const app = getApp();

Page({
  data: {
    goalName: '',
    goalAmount: 0,
    totalAssets: 0,
    progressPercentage: 0,

    // 各类别数据
    categories: {
      growth: { name: '增长投资', amount: 0, percentage: 0, color: '#10B981' },
      stability: { name: '稳定基金', amount: 0, percentage: 0, color: '#3B82F6' },
      essentials: { name: '基本开支', amount: 0, percentage: 0, color: '#F59E0B' },
      rewards: { name: '奖励消费', amount: 0, percentage: 0, color: '#F9A8D4' }
    },

    // 历史数据
    historyData: [],

    // 预测数据
    prediction: {
      monthsNeeded: 0,
      estimatedDate: '',
      monthlyGrowthRate: 0
    }
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  onReady() {
    // 页面渲染完成后绘制图表
    setTimeout(() => {
      this.drawPieChart();
      this.drawTrendChart();
    }, 100);
  },

  // 加载数据
  loadData() {
    const goal = app.globalData.goal;
    const totalAssets = app.getTotalAssets();
    const history = app.globalData.history || [];

    const categories = {
      growth: {
        name: '增长投资',
        amount: app.getCategoryTotal('growth'),
        percentage: parseFloat(app.getCategoryPercentage('growth')),
        color: '#10B981'
      },
      stability: {
        name: '稳定基金',
        amount: app.getCategoryTotal('stability'),
        percentage: parseFloat(app.getCategoryPercentage('stability')),
        color: '#3B82F6'
      },
      essentials: {
        name: '基本开支',
        amount: app.getCategoryTotal('essentials'),
        percentage: parseFloat(app.getCategoryPercentage('essentials')),
        color: '#F59E0B'
      },
      rewards: {
        name: '奖励消费',
        amount: app.getCategoryTotal('rewards'),
        percentage: parseFloat(app.getCategoryPercentage('rewards')),
        color: '#F9A8D4'
      }
    };

    const progressPercentage = goal.totalAmount > 0
      ? (totalAssets / goal.totalAmount * 100).toFixed(1)
      : 0;

    this.setData({
      goalName: goal.name || '未设置目标',
      goalAmount: goal.totalAmount || 0,
      totalAssets: totalAssets,
      progressPercentage: progressPercentage,
      categories: categories,
      historyData: history
    });

    this.calculatePrediction();
  },

  // 计算预测
  calculatePrediction() {
    const { goalAmount, totalAssets, historyData } = this.data;

    if (historyData.length < 2 || totalAssets >= goalAmount) {
      this.setData({
        'prediction.monthsNeeded': 0,
        'prediction.estimatedDate': '已达成目标',
        'prediction.monthlyGrowthRate': 0
      });
      return;
    }

    // 计算月均增长率
    const first = historyData[0];
    const last = historyData[historyData.length - 1];
    const startDate = new Date(first.date);
    const endDate = new Date(last.date);
    const monthsDiff = (endDate - startDate) / (1000 * 60 * 60 * 24 * 30);

    if (monthsDiff <= 0) {
      return;
    }

    const totalGrowth = last.totalAmount - first.totalAmount;
    const monthlyGrowth = totalGrowth / monthsDiff;

    if (monthlyGrowth <= 0) {
      this.setData({
        'prediction.monthsNeeded': 999,
        'prediction.estimatedDate': '需要增加储蓄',
        'prediction.monthlyGrowthRate': 0
      });
      return;
    }

    // 计算还需多少个月
    const remaining = goalAmount - totalAssets;
    const monthsNeeded = Math.ceil(remaining / monthlyGrowth);

    // 计算预计达成日期
    const estimatedDate = new Date();
    estimatedDate.setMonth(estimatedDate.getMonth() + monthsNeeded);
    const dateStr = `${estimatedDate.getFullYear()}年${estimatedDate.getMonth() + 1}月`;

    this.setData({
      'prediction.monthsNeeded': monthsNeeded,
      'prediction.estimatedDate': dateStr,
      'prediction.monthlyGrowthRate': monthlyGrowth.toFixed(2)
    });
  },

  // 绘制饼图
  drawPieChart() {
    const ctx = wx.createCanvasContext('pieChart', this);
    const { categories } = this.data;

    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const innerRadius = 60;

    let startAngle = -Math.PI / 2;

    for (let key in categories) {
      const category = categories[key];
      if (category.amount === 0) continue;

      const angle = (category.percentage / 100) * 2 * Math.PI;
      const endAngle = startAngle + angle;

      // 绘制扇形
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.setFillStyle(category.color);
      ctx.fill();

      startAngle = endAngle;
    }

    // 绘制中心白色圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.setFillStyle('#ffffff');
    ctx.fill();

    ctx.draw();
  },

  // 绘制趋势图
  drawTrendChart() {
    const ctx = wx.createCanvasContext('trendChart', this);
    const { historyData } = this.data;

    if (historyData.length === 0) {
      ctx.setFontSize(14);
      ctx.setFillStyle('#999');
      ctx.fillText('暂无历史数据', 150, 100);
      ctx.draw();
      return;
    }

    const width = 350;
    const height = 200;
    const padding = 40;

    // 找出最大值用于缩放
    const maxAmount = Math.max(...historyData.map(d => d.totalAmount));
    const minAmount = 0;

    // 绘制背景网格
    ctx.setStrokeStyle('#f3f4f6');
    ctx.setLineWidth(1);
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - 2 * padding) * i / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // 绘制折线
    ctx.setStrokeStyle('#667eea');
    ctx.setLineWidth(3);
    ctx.beginPath();

    historyData.forEach((record, index) => {
      const x = padding + (width - 2 * padding) * index / (historyData.length - 1 || 1);
      const y = height - padding - (height - 2 * padding) * (record.totalAmount - minAmount) / (maxAmount - minAmount || 1);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 绘制数据点
    historyData.forEach((record, index) => {
      const x = padding + (width - 2 * padding) * index / (historyData.length - 1 || 1);
      const y = height - padding - (height - 2 * padding) * (record.totalAmount - minAmount) / (maxAmount - minAmount || 1);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.setFillStyle('#667eea');
      ctx.fill();
    });

    // 绘制坐标轴标签
    ctx.setFontSize(12);
    ctx.setFillStyle('#666');
    ctx.fillText('¥0', 5, height - padding + 5);
    ctx.fillText(`¥${maxAmount.toFixed(0)}`, 5, padding);

    ctx.draw();
  }
});
