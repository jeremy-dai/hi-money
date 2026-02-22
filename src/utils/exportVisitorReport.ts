/**
 * Export Visitor Report Utility
 * 
 * Generates a PDF report for visitor mode scenarios.
 * Uses jsPDF library for PDF generation.
 * 
 * Note: This is a simplified implementation. For production use,
 * consider using html2canvas for more complex layouts.
 */

import type { DemoScenario } from '../types/visitor.types';
import type { InsuranceGapResult } from '../types/insurance.types';
import type { RetirementGapResult } from '../types/retirement.types';
import type { AllocationRecommendation } from '../types/allocation.types';

/**
 * Generate and download a PDF report for a visitor scenario
 * 
 * @param scenario - The demo scenario
 * @param allocation - Recommended allocation
 * @param insuranceGap - Insurance gap analysis
 * @param retirementGap - Retirement gap analysis
 */
export async function generateVisitorReport(
  scenario: DemoScenario,
  allocation: AllocationRecommendation | null,
  insuranceGap: InsuranceGapResult | null,
  retirementGap: RetirementGapResult | null
): Promise<void> {
  // Dynamic import of jsPDF to avoid bundling if not used
  try {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Page 1: Profile Summary
    doc.setFontSize(20);
    doc.text('Hi Money 财富规划报告', 20, 30);
    
    doc.setFontSize(14);
    doc.text(`场景: ${scenario.name}`, 20, 50);
    doc.text(`描述: ${scenario.description}`, 20, 60);
    
    doc.setFontSize(12);
    doc.text('用户信息', 20, 80);
    doc.text(`年龄: ${scenario.profile.age}岁`, 20, 90);
    doc.text(`月收入: ¥${scenario.profile.monthlyIncome.toLocaleString()}`, 20, 100);
    doc.text(`城市: ${scenario.profile.cityTier === 1 ? '一线' : scenario.profile.cityTier === 2 ? '二线' : scenario.profile.cityTier === 3 ? '三线' : '四线'}城市`, 20, 110);
    doc.text(`家庭状况: ${scenario.profile.maritalStatus === 'single' ? '单身' : scenario.profile.maritalStatus === 'married' ? '已婚' : '离异'}`, 20, 120);

    // Page 2: Allocation
    doc.addPage();
    doc.setFontSize(20);
    doc.text('推荐资产配置', 20, 30);
    
    if (allocation) {
      doc.setFontSize(12);
      doc.text(`增长投资: ${allocation.finalAllocation.growth}%`, 20, 50);
      doc.text(`稳健储蓄: ${allocation.finalAllocation.stability}%`, 20, 60);
      doc.text(`特殊用途: ${allocation.finalAllocation.special}%`, 20, 70);
      doc.text(`生活必需: ${allocation.finalAllocation.essentials}%`, 20, 80);
      doc.text(`奖励消费: ${allocation.finalAllocation.rewards}%`, 20, 90);
    }

    // Page 3: Insurance (if available)
    if (insuranceGap) {
      doc.addPage();
      doc.setFontSize(20);
      doc.text('保险保障分析', 20, 30);
      
      doc.setFontSize(12);
      let yPos = 50;
      insuranceGap.recommendations.forEach((rec) => {
        doc.text(`${rec.name}: 缺口 ¥${(rec.gap / 10000).toFixed(1)}万`, 20, yPos);
        yPos += 10;
      });
    }

    // Page 4: Retirement (if available)
    if (retirementGap) {
      doc.addPage();
      doc.setFontSize(20);
      doc.text('退休规划', 20, 30);
      
      doc.setFontSize(12);
      doc.text(`距离退休: ${retirementGap.yearsToRetirement}年`, 20, 50);
      doc.text(`预计养老金: ¥${retirementGap.pension.estimatedMonthlyPension.toLocaleString()}/月`, 20, 60);
      doc.text(`目标收入: ¥${retirementGap.desiredMonthlyIncome.toLocaleString()}/月`, 20, 70);
      doc.text(`建议月储蓄: ¥${retirementGap.actionPlan.monthlySavingsTarget.toLocaleString()}`, 20, 80);
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Hi Money - 第 ${i} 页 / 共 ${pageCount} 页`,
        105,
        285,
        { align: 'center' }
      );
      doc.text(
        new Date().toLocaleDateString('zh-CN'),
        20,
        285
      );
    }

    // Save PDF
    doc.save(`Hi-Money-报告-${scenario.name}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback: Show alert if jsPDF is not available
    alert('PDF导出功能需要安装 jsPDF 库。请运行: npm install jspdf');
  }
}

