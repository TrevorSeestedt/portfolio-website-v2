import React from 'react';
import { motion } from 'framer-motion';

/*  amount = 0-1  -> 0.25 = 25 % of element must enter viewport      *
 *  direction = 'up' | 'down' | 'left' | 'right'                     */
const getOffset = dir => {
  switch (dir) {
    case 'down'  : return { y: -50 };
    case 'left'  : return { x:  50 };
    case 'right' : return { x: -50 };
    default      : return { y:  50 };  // 'up'
  }
};

/**
 * ScrollReveal
 * Generic wrapper that fades & moves child into view when a portion of it enters the viewport.
 *
 * Props:
 *  - delay      : delay before the animation (seconds)
 *  - duration   : animation duration (seconds)
 *  - ease       : easing function name or array
 *  - amount     : fraction (0-1) of element that must enter viewport to trigger (default .25)
 *  - direction  : 'up' | 'down' | 'left' | 'right' (default 'up')
 */
export const ScrollReveal = ({
  children,
  delay = 0,
  duration = 0.7,
  ease = 'easeOut',
  amount = 0.25,
  direction = 'up',
  ...rest
}) => {
  const offset = getOffset(direction);

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
