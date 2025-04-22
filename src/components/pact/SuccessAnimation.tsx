
import React, { useEffect } from 'react';
import { fireSuccess } from '@/utils/confetti';

interface SuccessAnimationProps {
  children: React.ReactNode;
  show: boolean;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ children, show }) => {
  useEffect(() => {
    if (show) {
      // Fire confetti when success is shown
      fireSuccess();
    }
  }, [show]);

  return <>{children}</>;
};

export default SuccessAnimation;
