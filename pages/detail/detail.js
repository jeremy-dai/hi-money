// pages/detail/detail.js
Page({
  data: {
    type: '',
    categoryData: {}
  },

  onLoad(options) {
    const type = options.type || 'living';
    this.setData({ type });
    this.loadCategoryData(type);
  },

  loadCategoryData(type) {
    const categories = {
      living: {
        title: '精明消费，优化你的50%',
        subtitle: '让每一分钱都花在刀刃上',
        icon: '🏠',
        bgColor: 'linear-gradient(135deg, #FFD93D 0%, #FFA500 100%)',
        intro: '这部分资金用于保障您的日常生活。我们的目标不是削减快乐，而是聪明地优化大额开支，并用规则战胜冲动消费。',
        steps: [
          {
            title: '厘清你的"必需品"',
            description: '提供一个简单的两栏清单工具，让用户列出自己的"需求 (Needs)"和"欲望 (Wants)"，帮助看清消费核心。',
            type: 'list'
          },
          {
            title: '缩减两大关键开支',
            description: '住房和交通是最大的开销，思考一下：',
            type: 'questions',
            questions: [
              { icon: '🏠', text: '住房："有没有可能通过重新谈判来降低租金？"' },
              { icon: '🚗', text: '交通："一辆可靠的二手车，是否比新车更适合你？"' }
            ]
          },
          {
            title: '用规则代替意志力',
            description: '当你想冲动消费时，使用这个决策树：\n\n这是冲动消费吗？\n→ 是：等待24-48小时\n→ 否：列入预算后购买'
          }
        ]
      },
      investment: {
        title: '着眼未来，让你的25%为你工作',
        subtitle: '财富增长的核心引擎',
        icon: '📈',
        bgColor: 'linear-gradient(135deg, #6BCB77 0%, #4CAF50 100%)',
        intro: '这是你财富增长的核心引擎。通过持续投资，让复利的力量帮你走向财务自由。',
        steps: [
          {
            title: '选择你的增长型资产',
            description: '这是一个风险与回报的阶梯图，风险越高，潜在回报也越高。',
            type: 'risk-ladder'
          },
          {
            title: '建立节税账户',
            description: '利用好税收优惠的账户能显著加速你的财富增长（如401k, IRA等）。'
          },
          {
            title: '开始投资',
            description: '从银行转账到投资APP，再投入指数基金。',
            type: 'flow'
          }
        ]
      },
      stable: {
        title: '构筑基石，你的15%安全网',
        subtitle: '为未来的不确定性做准备',
        icon: '🛡️',
        bgColor: 'linear-gradient(135deg, #4D96FF 0%, #2196F3 100%)',
        intro: '这是你的安全网，用于应对突发状况和保护家人。稳定基金让你在面对意外时不会惊慌失措。',
        steps: [
          {
            title: '建立应急基金',
            description: '目标是积累3-6个月的生活开支。这笔钱应该放在高流动性、低风险的账户中（如货币市场基金或高收益储蓄账户）。'
          },
          {
            title: '购买保险',
            description: '评估你需要的保险类型：\n• 健康保险\n• 人寿保险\n• 财产保险\n• 收入保障保险'
          },
          {
            title: '定期审查',
            description: '每年至少审查一次你的安全网是否充足。随着收入增长和家庭变化，你的需求也会改变。'
          }
        ]
      },
      fun: {
        title: '投资快乐，你的10%自由金',
        subtitle: '享受当下，奖励自己',
        icon: '🎉',
        bgColor: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)',
        intro: '生活不只是为了未来，也要享受当下。这10%是你的"零罪恶感"消费基金，用来做任何让你开心的事。',
        steps: [
          {
            title: '无需解释的自由',
            description: '这笔钱可以用于任何让你快乐的事情：\n• 和朋友聚餐\n• 购买心仪已久的物品\n• 旅行和体验\n• 培养爱好'
          },
          {
            title: '设定快乐目标',
            description: '想想什么能真正让你快乐？列出你的"快乐清单"，然后用这笔钱去实现它们。'
          },
          {
            title: '平衡当下与未来',
            description: '记住：投资快乐不是浪费，而是投资于你的幸福和生活质量。快乐的你会更有动力去追求财务目标。'
          }
        ]
      }
    };

    this.setData({
      categoryData: categories[type] || categories.living
    });
  },

  markAsRead() {
    wx.navigateBack();
  }
})
