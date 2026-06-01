import * as React from 'react';
import {Surface} from '@/components/ui/Surface';

export type CardProps = React.ComponentProps<typeof Surface>;

export function Card({variant = 'card', ...props}: CardProps) {
  return <Surface variant={variant} {...props} />;
}


