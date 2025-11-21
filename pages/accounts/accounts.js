// pages/accounts/accounts.js
const app = getApp();

Page({
  data: {
    categories: [
      {
        key: 'growth',
        name: '增长投资',
        icon: '📈',
        color: '#10B981',
        percentage: 25
      },
      {
        key: 'stability',
        name: '稳定基金',
        icon: '🛡️',
        color: '#3B82F6',
        percentage: 15
      },
      {
        key: 'essentials',
        name: '基本开支',
        icon: '🏠',
        color: '#F59E0B',
        percentage: 50
      },
      {
        key: 'rewards',
        name: '奖励消费',
        icon: '🎁',
        color: '#F9A8D4',
        percentage: 10
      }
    ],

    accounts: {
      growth: [],
      stability: [],
      essentials: [],
      rewards: []
    },

    categoryTotals: {
      growth: 0,
      stability: 0,
      essentials: 0,
      rewards: 0
    },

    totalAssets: 0,
    goalAmount: 0
  },

  onLoad() {
    this.loadAccounts();
  },

  onShow() {
    this.loadAccounts();
  },

  // 加载账户数据
  loadAccounts() {
    const accounts = app.globalData.accounts;
    const goalAmount = app.globalData.goal.totalAmount || 0;

    this.setData({
      accounts: accounts,
      goalAmount: goalAmount
    });

    this.calculateTotals();
  },

  // 计算各类别总金额
  calculateTotals() {
    const { accounts } = this.data;
    const totals = {};
    let totalAssets = 0;

    for (let category in accounts) {
      const categoryTotal = accounts[category].reduce((sum, account) => {
        return sum + (parseFloat(account.amount) || 0);
      }, 0);
      totals[category] = categoryTotal;
      totalAssets += categoryTotal;
    }

    this.setData({
      categoryTotals: totals,
      totalAssets: totalAssets
    });
  },

  // 添加账户
  addAccount(e) {
    const category = e.currentTarget.dataset.category;

    wx.showModal({
      title: '添加账户',
      editable: true,
      placeholderText: '例如：支付宝基金',
      success: (res) => {
        if (res.confirm && res.content) {
          const accountName = res.content.trim();
          if (accountName) {
            const accounts = this.data.accounts;
            accounts[category].push({
              name: accountName,
              amount: 0
            });

            this.setData({ accounts });
            this.saveAccounts();
          }
        }
      }
    });
  },

  // 更新账户金额
  updateAccountAmount(e) {
    const { category, index } = e.currentTarget.dataset;
    const currentAmount = this.data.accounts[category][index].amount;

    wx.showModal({
      title: '更新金额',
      editable: true,
      placeholderText: '输入当前金额',
      content: currentAmount.toString(),
      success: (res) => {
        if (res.confirm) {
          const amount = parseFloat(res.content) || 0;
          const accounts = this.data.accounts;
          accounts[category][index].amount = amount;

          this.setData({ accounts });
          this.calculateTotals();
          this.saveAccounts();
        }
      }
    });
  },

  // 删除账户
  deleteAccount(e) {
    const { category, index } = e.currentTarget.dataset;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个账户吗？',
      success: (res) => {
        if (res.confirm) {
          const accounts = this.data.accounts;
          accounts[category].splice(index, 1);

          this.setData({ accounts });
          this.calculateTotals();
          this.saveAccounts();

          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 保存账户数据
  saveAccounts() {
    app.globalData.accounts = this.data.accounts;
    app.saveData();

    // 如果是第一次设置，添加初始历史记录
    if (app.globalData.history.length === 0) {
      app.addHistory('initial');
    }
  },

  // 完成设置
  completeSetup() {
    const { totalAssets } = this.data;

    if (totalAssets === 0) {
      wx.showModal({
        title: '提示',
        content: '您还没有添加任何账户金额，是否继续？',
        success: (res) => {
          if (res.confirm) {
            this.navigateToDashboard();
          }
        }
      });
      return;
    }

    this.saveAccounts();
    wx.showToast({
      title: '设置完成',
      icon: 'success'
    });

    setTimeout(() => {
      this.navigateToDashboard();
    }, 1500);
  },

  // 跳转到仪表盘
  navigateToDashboard() {
    wx.redirectTo({
      url: '/pages/dashboard/dashboard'
    });
  }
});
