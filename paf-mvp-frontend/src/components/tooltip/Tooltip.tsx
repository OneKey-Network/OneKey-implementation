import { h } from 'preact';
import classes from './style.scss';

interface ITooltipProps {
  icon?: string | JSX.Element;
  children?: string | JSX.Element | Array<JSX.Element>;
}

const defaultIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.99992 13.6663C3.31802 13.6663 0.333252 10.6816 0.333252 6.99967C0.333252 3.31778 3.31802 0.333008 6.99992
    0.333008C10.6818 0.333008 13.6666 3.31778 13.6666 6.99967C13.6625 10.6799 10.6801 13.6623 6.99992 13.6663ZM1.66659
     7.11434C1.69813 10.0485 4.09399 12.406 7.02828 12.3903C9.96257 12.3745 12.3329 9.99134 12.3329 7.05701C12.3329
     4.12268 9.96257 1.73952 7.02828 1.72367C4.09399 1.70798 1.69813 4.06551 1.66659 6.99967V7.11434ZM8.33325
     10.333H6.33325V7.66634H5.66659V6.33301H7.66659V8.99967H8.33325V10.333ZM7.66659
     4.99967H6.33325V3.66634H7.66659V4.99967Z"
      fill="#120B45"
    />
  </svg>
);

export const Tooltip = ({ children, icon = defaultIcon }: ITooltipProps) => {
  return (
    <div class={classes.container}>
      <span class={classes.icon}>{icon}</span>

      <div class={classes.tooltipContent}>
        <div class={classes.icon}>{icon}</div>
        {children}
      </div>
    </div>
  );
};
