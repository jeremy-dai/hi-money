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
    hasCompletedSetup: false,

    // 新增：财务目标
    goal: {
      name: '',           // 目标名称，如"买房首付"
      totalAmount: 0,     // 总目标金额
      createdAt: ''       // 创建时间
    },

    // 新增：各类别的多账户管理
    accounts: {
      growth: [],        // 增长投资账户列表 [{ name: '支付宝基金', amount: 8000 }, ...]
      stability: [],     // 稳定基金账户列表
      essentials: [],    // 基本开支账户列表
      rewards: []        // 奖励消费账户列表
    },

    // 新增：历史记录
    history: []  // [{ date, type, totalAmount, snapshot, income, allocation }, ...]
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
    wx.setStorageSync('goal', this.globalData.goal);
    wx.setStorageSync('accounts', this.globalData.accounts);
    wx.setStorageSync('history', this.globalData.history);
  },

  // 从本地存储加载数据
  loadData() {
    const income = wx.getStorageSync('monthlyIncome');
    const allocation = wx.getStorageSync('allocation');
    const hasCompleted = wx.getStorageSync('hasCompletedSetup');
    const goal = wx.getStorageSync('goal');
    const accounts = wx.getStorageSync('accounts');
    const history = wx.getStorageSync('history');

    if (income) this.globalData.monthlyIncome = income;
    if (allocation) this.globalData.allocation = allocation;
    if (hasCompleted) this.globalData.hasCompletedSetup = hasCompleted;
    if (goal) this.globalData.goal = goal;
    if (accounts) this.globalData.accounts = accounts;
    if (history) this.globalData.history = history;
  },

  // 新增：计算各类别总金额
  getCategoryTotal(category) {
    const accounts = this.globalData.accounts[category] || [];
    return accounts.reduce((sum, account) => sum + (account.amount || 0), 0);
  },

  // 新增：计算总资产
  getTotalAssets() {
    return this.getCategoryTotal('growth') +
           this.getCategoryTotal('stability') +
           this.getCategoryTotal('essentials') +
           this.getCategoryTotal('rewards');
  },

  // 新增：计算各类别目标金额
  getCategoryGoal(category) {
    const totalGoal = this.globalData.goal.totalAmount || 0;
    const percentage = this.globalData.allocation[category] || 0;
    return totalGoal * percentage / 100;
  },

  // 新增：计算各类别实际占比
  getCategoryPercentage(category) {
    const total = this.getTotalAssets();
    if (total === 0) return 0;
    const categoryAmount = this.getCategoryTotal(category);
    return (categoryAmount / total * 100).toFixed(1);
  },

  // 新增：计算各类别偏离度（实际占比 - 目标占比）
  getCategoryDeviation(category) {
    const actualPercentage = parseFloat(this.getCategoryPercentage(category));
    const targetPercentage = this.globalData.allocation[category] || 0;
    return actualPercentage - targetPercentage;
  },

  // 新增：添加历史记录
  addHistory(type, income = 0, allocation = null) {
    const record = {
      date: new Date().toISOString(),
      type: type,  // 'initial' | 'income' | 'update'
      totalAmount: this.getTotalAssets(),
      snapshot: {
        growth: this.getCategoryTotal('growth'),
        stability: this.getCategoryTotal('stability'),
        essentials: this.getCategoryTotal('essentials'),
        rewards: this.getCategoryTotal('rewards')
      }
    };

    if (income > 0) {
      record.income = income;
    }
    if (allocation) {
      record.allocation = allocation;
    }

    this.globalData.history.push(record);
    this.saveData();
  }
})
