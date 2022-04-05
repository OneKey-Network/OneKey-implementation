import { h } from 'preact';
import style from './style.scss';
import { Cross } from '../svg/cross/Cross';
import { useState } from 'preact/hooks';
import { OnekeyLogo } from '../svg/onekey-logo/OnekeyLogo';
import { Button } from '../button/Button';

export interface ISnackBarProps {
  icon: JSX.Element;
  title: string | JSX.Element;
  message: string | JSX.Element;
  onClose: () => void;
}

export const SnackBar = ({ icon, title, message, onClose }: ISnackBarProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const animateAndClose = () => {
    setIsOpen(false);
    setTimeout(() => onClose(), 1000);
  };

  return (
    <div class={`${style.container} ${isOpen ? style.open : ''}`} data-testid="notification-container">
      <div class={style.body}>
        <div class={style.icon}>{icon}</div>
        <div class={style.content} data-testid="notification-content">
          <h2 class={style.title}>{title}</h2>
          {message}
        </div>
        <div class={style.closeBtnWrapper}>
          <Button testid="notification-close-btn" accent action={() => animateAndClose()}>
            <Cross />
          </Button>
        </div>
      </div>
      <div class={style.footer}>
        <i>Better advertising experience by</i>
        <OnekeyLogo />
      </div>
    </div>
  );
};
