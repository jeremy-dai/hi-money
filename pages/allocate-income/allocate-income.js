// pages/allocate-income/allocate-income.js
const app = getApp();

Page({
  data: {
    incomeAmount: '',

    // 当前状态
    currentStatus: {
      totalAssets: 0,
      growth: { current: 0, percentage: 0, deviation: 0 },
      stability: { current: 0, percentage: 0, deviation: 0 },
      essentials: { current: 0, percentage: 0, deviation: 0 },
      rewards: { current: 0, percentage: 0, deviation: 0 }
    },

    // 两种分配方案
    planA: null,  // 固定比例方案
    planB: null,  // 智能平衡方案

    selectedPlan: 'A',  // 默认选择方案A

    // 目标分配比例
    targetAllocation: {
      growth: 25,
      stability: 15,
      essentials: 50,
      rewards: 10
    }
  },

  onLoad() {
    this.analyzeCurrentStatus();
  },

  // 分析当前状态
  analyzeCurrentStatus() {
    const growth = app.getCategoryTotal('growth');
    const stability = app.getCategoryTotal('stability');
    const essentials = app.getCategoryTotal('essentials');
    const rewards = app.getCategoryTotal('rewards');
    const totalAssets = app.getTotalAssets();

    const currentStatus = {
      totalAssets: totalAssets,
      growth: {
        current: growth,
        percentage: totalAssets > 0 ? (growth / totalAssets * 100) : 0,
        deviation: app.getCategoryDeviation('growth')
      },
      stability: {
        current: stability,
        percentage: totalAssets > 0 ? (stability / totalAssets * 100) : 0,
        deviation: app.getCategoryDeviation('stability')
      },
      essentials: {
        current: essentials,
        percentage: totalAssets > 0 ? (essentials / totalAssets * 100) : 0,
        deviation: app.getCategoryDeviation('essentials')
      },
      rewards: {
        current: rewards,
        percentage: totalAssets > 0 ? (rewards / totalAssets * 100) : 0,
        deviation: app.getCategoryDeviation('rewards')
      }
    };

    this.setData({ currentStatus });
  },

  // 输入收入金额
  onIncomeInput(e) {
    const amount = parseFloat(e.detail.value) || 0;
    this.setData({
      incomeAmount: e.detail.value
    });

    if (amount > 0) {
      this.calculatePlans(amount);
    }
  },

  // 计算两种分配方案
  calculatePlans(income) {
    // 方案A：固定比例分配
    const planA = {
      growth: (income * this.data.targetAllocation.growth / 100),
      stability: (income * this.data.targetAllocation.stability / 100),
      essentials: (income * this.data.targetAllocation.essentials / 100),
      rewards: (income * this.data.targetAllocation.rewards / 100)
    };

    // 方案B：智能平衡分配
    const planB = this.calculateSmartAllocation(income);

    this.setData({ planA, planB });
  },

  // 计算智能平衡分配
  calculateSmartAllocation(income) {
    const { currentStatus, targetAllocation } = this.data;

    // 计算各类别的偏离度（负值表示不足，正值表示超标）
    const deviations = {
      growth: currentStatus.growth.deviation,
      stability: currentStatus.stability.deviation,
      essentials: currentStatus.essentials.deviation,
      rewards: currentStatus.rewards.deviation
    };

    // 找出不足的类别和超标的类别
    const deficit = {};  // 不足的类别
    const surplus = {};  // 超标的类别
    let totalDeficit = 0;

    for (let category in deviations) {
      if (deviations[category] < 0) {
        deficit[category] = Math.abs(deviations[category]);
        totalDeficit += Math.abs(deviations[category]);
      } else if (deviations[category] > 0) {
        surplus[category] = deviations[category];
      }
    }

    // 智能分配策略
    const allocation = {};

    if (totalDeficit === 0) {
      // 如果没有不足的类别，按固定比例分配
      for (let category in targetAllocation) {
        allocation[category] = income * targetAllocation[category] / 100;
      }
    } else {
      // 有不足的类别，优先补齐不足
      let remainingIncome = income;

      // 先给不足的类别分配更多
      for (let category in deficit) {
        const weight = deficit[category] / totalDeficit;
        const extraAllocation = weight * income * 0.3;  // 额外分配30%
        const baseAllocation = income * targetAllocation[category] / 100;
        allocation[category] = baseAllocation + extraAllocation;
        remainingIncome -= allocation[category];
      }

      // 超标的类别减少分配
      for (let category in surplus) {
        const reduction = income * targetAllocation[category] / 100 * 0.5;  // 减少50%
        allocation[category] = income * targetAllocation[category] / 100 - reduction;
        remainingIncome -= allocation[category];
      }

      // 其他类别按比例分配剩余
      for (let category in targetAllocation) {
        if (!deficit[category] && !surplus[category]) {
          allocation[category] = income * targetAllocation[category] / 100;
          remainingIncome -= allocation[category];
        }
      }

      // 调整确保总和等于收入
      if (Math.abs(remainingIncome) > 0.01) {
        // 将剩余金额按比例分配给所有类别
        for (let category in allocation) {
          allocation[category] += remainingIncome * targetAllocation[category] / 100;
        }
      }
    }

    return allocation;
  },

  // 选择方案
  selectPlan(e) {
    const plan = e.currentTarget.dataset.plan;
    this.setData({ selectedPlan: plan });
  },

  // 确认分配
  confirmAllocation() {
    const { incomeAmount, selectedPlan, planA, planB } = this.data;

    if (!incomeAmount || parseFloat(incomeAmount) <= 0) {
      wx.showToast({
        title: '请输入收入金额',
        icon: 'none'
      });
      return;
    }

    const allocation = selectedPlan === 'A' ? planA : planB;

    wx.showModal({
      title: '确认分配',
      content: '分配后请手动转账到对应账户，然后到"管理账户"页面更新金额',
      success: (res) => {
        if (res.confirm) {
          // 记录历史
          app.addHistory('income', parseFloat(incomeAmount), allocation);

          wx.showToast({
            title: '分配记录已保存',
            icon: 'success'
          });

          // 跳转到账户管理页面
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/accounts/accounts'
            });
          }, 1500);
        }
      }
    });
  }
});
