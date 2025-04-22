
import React, { useEffect } from 'react';
import { fireSuccess, fireBigSuccess } from '@/utils/confetti';

interface SuccessAnimationProps {
  children: React.ReactNode;
  show: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ children, show, size = 'medium' }) => {
  useEffect(() => {
    if (show) {
      // Fire confetti when success is shown
      if (size === 'large') {
        fireBigSuccess();
      } else {
        fireSuccess();
      }
    }
  }, [show, size]);

  return <>{children}</>;
};

export default SuccessAnimation;
