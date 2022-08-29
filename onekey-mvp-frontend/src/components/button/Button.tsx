import { h } from 'preact';
import classes from './style.scss';

interface IButtonProps {
  wide?: boolean;
  small?: boolean;
  accent?: boolean;
  testid?: string;
  outline?: boolean;
  primary?: boolean;
  rounded?: boolean;
  disabled?: boolean;
  highlight?: boolean;
  children?: JSX.Element | Array<JSX.Element | string> | string;
  classList?: string;

  action: (event: Event) => void;
}

export const Button = ({
  disabled = false,
  children,
  small,
  wide,
  primary,
  rounded,
  action,
  accent,
  outline,
  highlight,
  classList,
  testid,
}: IButtonProps) => {
  const classNames = [
    classList,
    classes.btn,
    small && classes.small,
    primary && classes.primary,
    rounded && classes.rounded,
    wide && classes.wide,
    accent && classes.accent,
    highlight && classes.highlight,
    outline && classes.outline,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button class={classNames} disabled={disabled} data-testid={testid} onClick={(event) => action(event)}>
      {children}
    </button>
  );
};
