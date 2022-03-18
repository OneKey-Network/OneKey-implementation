import { h } from 'preact';
import classes from './style.scss';

interface IButtonProps {
  wide?: boolean;
  small?: boolean;
  accent?: boolean;
  outline?: boolean;
  primary?: boolean;
  disabled?: boolean;
  children?: JSX.Element | Array<JSX.Element> | string;
  classList?: string;

  action: (event: Event) => void;
}

export const Button = ({
  disabled = false,
  children,
  small,
  wide,
  primary,
  action,
  accent,
  outline,
  classList,
}: IButtonProps) => {
  const classNames = [
    classList,
    classes.btn,
    small && classes.small,
    primary && classes.primary,
    wide && classes.wide,
    accent && classes.accent,
    outline && classes.outline,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button class={classNames} disabled={disabled} onClick={(event) => action(event)}>
      {children}
    </button>
  );
};
