export interface StatItem {
  label: string;
  value: number | string;
  color?: string;
  outlined?: boolean;
  outlineColor?: string;
}

export interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  stats: StatItem[];
  warn?: boolean;
}

export interface StatCardConfig<Props> {
  title: string;
  iconSrc: string;
  iconAlt: string;
  iconColor: string;
  warnCondition?: (props: Props) => boolean;
  stats: (props: Props) => StatItem[];
}
