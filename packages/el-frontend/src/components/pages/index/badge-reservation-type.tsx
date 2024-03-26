import { Badge } from 'flowbite-react';
import { FC } from 'react';

export interface BadgeReservationTypeProps {
  startup: boolean;
}

export const BadgeReservationType: FC<BadgeReservationTypeProps> = ({ startup }) => {
  return <Badge color={startup ? 'success' : 'indigo'}>{startup ? '起動' : '停止'}</Badge>;
};
