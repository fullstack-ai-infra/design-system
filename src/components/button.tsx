import { Button as AntButton, ConfigProvider } from 'antd';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  forwardRef,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from 'react';

import { cn } from '../lib';
import { getDSAiTokens, useDSMode, useDSThemeProfile } from '../ds-provider';

// Kept for consumers that compose class names directly; the facade itself
// renders antd buttons (ADR 0002).
const buttonVariants = cva('ui-button', {
  variants: {
    variant: {
      primary: 'ui-button--primary',
      secondary: 'ui-button--secondary',
      ghost: 'ui-button--ghost',
      ai: 'ui-button--ai',
      danger: 'ui-button--danger',
    },
    size: {
      sm: 'ui-button--sm',
      md: 'ui-button--md',
      lg: 'ui-button--lg',
      icon: 'ui-button--icon',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

const antdTypeByVariant = {
  primary: 'primary',
  secondary: 'default',
  ghost: 'text',
  ai: 'primary',
  danger: 'primary',
} as const;

const antdSizeBySize = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
  icon: 'middle',
} as const;

// The facade only passes through props consumers actually use (D-L5 §3.1);
// data-* attributes pass through for composition triggers such as Radix.
export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  title?: string;
  tabIndex?: number;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  [dataAttribute: `data-${string}`]: unknown;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => {
    const mode = useDSMode();
    const profile = useDSThemeProfile();
    const button = (
      <AntButton
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        type={antdTypeByVariant[variant ?? 'primary']}
        danger={variant === 'danger'}
        size={antdSizeBySize[size ?? 'md']}
        htmlType={type}
        {...props}
      />
    );

    if (variant === 'ai') {
      return (
        <ConfigProvider theme={{ hashed: true, token: getDSAiTokens(profile, mode) }}>
          {button}
        </ConfigProvider>
      );
    }

    return button;
  },
);
Button.displayName = 'Button';

export { buttonVariants };
