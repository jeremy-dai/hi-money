// pages/goal/goal.js
const app = getApp();

Page({
  data: {
    goalName: '',
    goalAmount: '',

    // 计算出的各类别目标
    categoryGoals: {
      growth: 0,
      stability: 0,
      essentials: 0,
      rewards: 0
    }
  },

  onLoad() {
    // 加载已有目标
    const goal = app.globalData.goal;
    if (goal && goal.totalAmount > 0) {
      this.setData({
        goalName: goal.name,
        goalAmount: goal.totalAmount.toString()
      });
      this.calculateCategoryGoals(goal.totalAmount);
    }
  },

  // 输入目标名称
  onGoalNameInput(e) {
    this.setData({
      goalName: e.detail.value
    });
  },

  // 输入目标金额
  onGoalAmountInput(e) {
    const amount = parseFloat(e.detail.value) || 0;
    this.setData({
      goalAmount: e.detail.value
    });
    this.calculateCategoryGoals(amount);
  },

  // 计算各类别目标金额
  calculateCategoryGoals(totalAmount) {
    const allocation = app.globalData.allocation;
    this.setData({
      categoryGoals: {
        growth: (totalAmount * allocation.growth / 100).toFixed(2),
        stability: (totalAmount * allocation.stability / 100).toFixed(2),
        essentials: (totalAmount * allocation.essentials / 100).toFixed(2),
        rewards: (totalAmount * allocation.rewards / 100).toFixed(2)
      }
    });
  },

  // 保存目标
  saveGoal() {
    const { goalName, goalAmount } = this.data;

    if (!goalName.trim()) {
      wx.showToast({
        title: '请输入目标名称',
        icon: 'none'
      });
      return;
    }

    if (!goalAmount || parseFloat(goalAmount) <= 0) {
      wx.showToast({
        title: '请输入有效的目标金额',
        icon: 'none'
      });
      return;
    }

    // 保存到全局数据
    app.globalData.goal = {
      name: goalName,
      totalAmount: parseFloat(goalAmount),
      createdAt: new Date().toISOString()
    };

    app.saveData();

    wx.showToast({
      title: '目标已保存',
      icon: 'success'
    });

    // 延迟跳转到账户管理页面
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/accounts/accounts'
      });
    }, 1500);
  }
});
