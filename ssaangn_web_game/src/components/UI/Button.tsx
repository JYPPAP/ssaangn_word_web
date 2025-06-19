/**
 * 버튼 컴포넌트
 * 
 * 재사용 가능한 버튼 컴포넌트입니다.
 * - 다양한 스타일 변형 (primary, secondary, ghost 등)
 * - 크기 옵션 (small, medium, large)
 * - 로딩 상태 및 비활성화 상태
 * - 접근성 고려 (키보드 네비게이션, ARIA)
 * - 애니메이션 효과
 */

import React, { forwardRef } from 'react';
import './Button.css';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** 버튼 변형 */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'outline';
  /** 버튼 크기 */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  /** 로딩 상태 */
  loading?: boolean;
  /** 전체 너비 사용 */
  fullWidth?: boolean;
  /** 아이콘 전용 버튼 */
  iconOnly?: boolean;
  /** 좌측 아이콘 */
  leftIcon?: React.ReactNode;
  /** 우측 아이콘 */
  rightIcon?: React.ReactNode;
  /** 애니메이션 사용 여부 */
  animated?: boolean;
  /** 버튼 타입 */
  type?: 'button' | 'submit' | 'reset';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  iconOnly = false,
  leftIcon,
  rightIcon,
  animated = true,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}, ref) => {
  // 버튼 클래스 생성
  const getButtonClass = () => {
    let className = 'button';
    className += ` button-${variant}`;
    className += ` button-${size}`;
    
    if (fullWidth) className += ' button-full-width';
    if (iconOnly) className += ' button-icon-only';
    if (loading) className += ' button-loading';
    if (disabled) className += ' button-disabled';
    
    return className;
  };

  // 최종 클래스명
  const finalClassName = `${getButtonClass()} ${className}`.trim();

  // 버튼이 비활성화되어야 하는 조건
  const isDisabled = disabled || loading;

  // 로딩 스피너 컴포넌트
  const LoadingSpinner = () => (
    <div className="button-spinner">
      <div className="spinner" />
    </div>
  );

  // 버튼 내용
  const buttonContent = (
    <>
      {loading && <LoadingSpinner />}
      {leftIcon && !loading && (
        <span className="button-icon button-left-icon">
          {leftIcon}
        </span>
      )}
      {children && !iconOnly && (
        <span className="button-text">
          {children}
        </span>
      )}
      {iconOnly && !loading && children}
      {rightIcon && !loading && (
        <span className="button-icon button-right-icon">
          {rightIcon}
        </span>
      )}
    </>
  );

  // animated는 CSS로 처리

  return (
    <button
      ref={ref}
      type={type}
      className={finalClassName}
      disabled={isDisabled}
      {...props}
    >
      {buttonContent}
    </button>
  );
});

Button.displayName = 'Button';

/**
 * 아이콘 버튼 컴포넌트
 */
interface IconButtonProps extends Omit<ButtonProps, 'iconOnly'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  'aria-label': ariaLabel,
  size = 'medium',
  variant = 'ghost',
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      iconOnly
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

/**
 * 버튼 그룹 컴포넌트
 */
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  fullWidth?: boolean;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  size,
  variant,
  fullWidth = false,
  className = ''
}) => {
  const groupClass = `button-group button-group-${orientation} ${fullWidth ? 'button-group-full-width' : ''} ${className}`.trim();

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === Button) {
      const childProps = child.props as ButtonProps;
      return React.cloneElement(child as React.ReactElement<ButtonProps>, {
        size: childProps.size || size,
        variant: childProps.variant || variant,
        fullWidth: fullWidth || childProps.fullWidth
      });
    }
    return child;
  });

  return (
    <div className={groupClass}>
      {enhancedChildren}
    </div>
  );
};

export default Button;