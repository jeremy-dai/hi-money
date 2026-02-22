import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import { cn } from '@/lib/utils';
import type { CategoryType } from '../../types';
import { CATEGORY_COLORS } from '../../utils/constants';
import { CategoryIcon } from '../../utils/icons';
import { formatCNY } from '@/lib/format';

interface WealthCardProps {
  type: CategoryType;
  title: string;
  percentage: number;
  amount: number;
  subtitle: string;
  onClick?: () => void;
}

export function WealthCard({ type, title, percentage, amount, subtitle, onClick }: WealthCardProps) {
  const color = CATEGORY_COLORS[type];

  return (
    <CardContainer className="inter-var py-4" containerClassName="py-0">
      <CardBody className="bg-black-elevated relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-gold-primary/20 w-full h-auto rounded-xl p-6 border transition-all duration-300 hover:border-gold-primary/40 hover:shadow-gold">
        <div onClick={onClick} className={cn("cursor-pointer", onClick && "cursor-pointer")}>
          <CardItem
            translateZ="50"
            className="text-xl font-bold text-neutral-600 dark:text-white flex justify-between items-center w-full mb-4"
          >
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <div className="text-gold-primary">
              <CategoryIcon type={type} className="drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" size={32} strokeWidth={2} />
            </div>
          </CardItem>

          <CardItem
            as="p"
            translateZ="60"
            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
          >
            <span className="text-3xl font-bold mb-2 block" style={{ color }}>
              {percentage}%
            </span>
          </CardItem>
          
          <CardItem translateZ="100" className="w-full mt-4">
            <div className="text-2xl font-mono font-bold text-gold-primary mb-2 glow-gold">
              {formatCNY(amount)}
            </div>
          </CardItem>

          <CardItem
            translateZ="40"
            className="text-sm text-gray-400 mt-2"
          >
            {subtitle}
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
