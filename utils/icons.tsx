import React from 'react';
import {
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  BookOpenIcon,
  CogIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface IconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export const AppCheckIcon: React.FC<IconProps> = ({ className = '', size = 'md', 'aria-label': ariaLabel }) => (
  <CheckIcon 
    className={`${sizeClasses[size]} ${className}`}
    aria-label={ariaLabel}
  />
);

export const AppIncompleteIcon: React.FC<IconProps> = ({ className = '', size = 'md', 'aria-label': ariaLabel }) => (
  <ClockIcon 
    className={`${sizeClasses[size]} ${className}`}
    aria-label={ariaLabel}
  />
);

export const AppCalendarIcon: React.FC<IconProps> = ({ className = '', size = 'md', 'aria-label': ariaLabel }) => (
  <CalendarIcon 
    className={`${sizeClasses[size]} ${className}`}
    aria-label={ariaLabel}
  />
);

export const AppBookIcon: React.FC<IconProps> = ({ className = '', size = 'md', 'aria-label': ariaLabel }) => (
  <BookOpenIcon 
    className={`${sizeClasses[size]} ${className}`}
    aria-label={ariaLabel}
  />
);

export const AppCogIcon: React.FC<IconProps> = ({ className = '', size = 'md', 'aria-label': ariaLabel }) => (
  <CogIcon 
    className={`${sizeClasses[size]} ${className}`}
    aria-label={ariaLabel}
  />
);

export const AppChevronDownIcon: React.FC<IconProps> = ({ className = '', size = 'md', 'aria-label': ariaLabel }) => (
  <ChevronDownIcon 
    className={`${sizeClasses[size]} ${className}`}
    aria-label={ariaLabel}
  />
);

export const AppXMarkIcon: React.FC<IconProps> = ({ className = '', size = 'md', 'aria-label': ariaLabel }) => (
  <XMarkIcon 
    className={`${sizeClasses[size]} ${className}`}
    aria-label={ariaLabel}
  />
);

export const AppCheckCircleIcon: React.FC<IconProps> = ({ className = '', size = 'md', 'aria-label': ariaLabel }) => (
  <CheckCircleIcon 
    className={`${sizeClasses[size]} ${className}`}
    aria-label={ariaLabel}
  />
);

export const AppXCircleIcon: React.FC<IconProps> = ({ className = '', size = 'md', 'aria-label': ariaLabel }) => (
  <XCircleIcon 
    className={`${sizeClasses[size]} ${className}`}
    aria-label={ariaLabel}
  />
);

export const iconMap = {
  check: AppCheckIcon,
  incomplete: AppIncompleteIcon,
  calendar: AppCalendarIcon,
  book: AppBookIcon,
  cog: AppCogIcon,
  chevronDown: AppChevronDownIcon,
  xmark: AppXMarkIcon,
  checkCircle: AppCheckCircleIcon,
  xCircle: AppXCircleIcon,
} as const;

export type IconName = keyof typeof iconMap;