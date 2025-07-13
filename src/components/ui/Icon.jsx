import React from 'react';
import { icons } from 'lucide-react';

const Icon = ({ name, color, size, className }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    return null; // Or return a default icon
  }

  return <LucideIcon color={color} size={size} className={className} />;
};

export default Icon;