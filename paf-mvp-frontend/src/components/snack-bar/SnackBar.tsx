import { h } from 'preact';
import style from './style.scss';
import { Cross } from '../svg/cross/Cross';
import { useState } from 'preact/hooks';

export interface ISnackBarProps {
  icon: JSX.Element,
  title: string | JSX.Element,
  message: string | JSX.Element,
  onClose: () => void,
}

export const SnackBar = ({ icon, title, message, onClose }: ISnackBarProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const animateAndClose = () => {
    setIsOpen(false);
    setTimeout(() => onClose(), 1000);
  }

  return (
    <div class={`${style.container} ${isOpen ? style.open : ''}`}>
      <div class={style.body}>
        <div class={style.icon}>
          {icon}
        </div>
        <div class={style.content}>
          <h2 class={style.title}>
            {title}
          </h2>
          {message}
        </div>
        <div class={style.closeBtnWrapper}>
          <button onClick={() => animateAndClose()} class={style.closeBtn}>
            <Cross />
          </button>
        </div>
      </div>
      <div class={style.footer}/>
    </div>
  );
};
