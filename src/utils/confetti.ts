
import confetti from 'canvas-confetti';

export const fireConfetti = (options?: confetti.Options) => {
  const defaults = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#9b87f5', '#F97316', '#D946EF'],
  };

  confetti({
    ...defaults,
    ...options,
  });
};

export const fireSchoolPride = () => {
  const end = Date.now() + 1500;

  const colors = ['#9b87f5', '#D946EF'];

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

export const fireSuccess = () => {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaultColor = ['#9b87f5', '#D946EF', '#F97316'];

  (function frame() {
    confetti({
      particleCount: 3,
      startVelocity: 50,
      angle: 135,
      spread: 60,
      origin: { x: 0.2, y: 0.8 },
      colors: defaultColor,
    });

    confetti({
      particleCount: 3,
      startVelocity: 50,
      angle: 45,
      spread: 60,
      origin: { x: 0.8, y: 0.8 },
      colors: defaultColor,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  })();
};

// Enhanced success animation with more confetti
export const fireBigSuccess = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const colors = ['#9b87f5', '#D946EF', '#F97316', '#22c55e', '#3b82f6'];

  const fireConfettiWave = () => {
    confetti({
      particleCount: 80,
      angle: 130,
      spread: 70,
      origin: { x: 0.15, y: 0.9 },
      colors: colors,
      startVelocity: 45,
      gravity: 1,
      scalar: 1.2
    });

    confetti({
      particleCount: 80,
      angle: 50,
      spread: 70,
      origin: { x: 0.85, y: 0.9 },
      colors: colors,
      startVelocity: 45,
      gravity: 1,
      scalar: 1.2
    });
  };

  // Fire initial burst
  fireConfettiWave();

  // Schedule subsequent bursts
  const interval = setInterval(() => {
    if (Date.now() > animationEnd) {
      clearInterval(interval);
      return;
    }
    fireConfettiWave();
  }, 750);
};
