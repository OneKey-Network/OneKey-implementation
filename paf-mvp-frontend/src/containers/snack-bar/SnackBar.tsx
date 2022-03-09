import { h } from 'preact';
import style from './style.scss';
import { Cross } from '../../components/svg/cross/Cross';

interface ISnackBar {
  icon: JSX.Element,
  title: string | JSX.Element,
  message: string | JSX.Element,
}

export const SnackBar = ({ icon, title, message }: ISnackBar) => {

  return (
    <div class={style.container}>
      <div class={style.body}>
        <div class={style.icon}>
          {icon}
        </div>
        <div>
          <h2 class={style.title}>
            {title}
          </h2>
          <div>
            {message}
          </div>
        </div>
        <div>
          <button class={style.closeBtn}>
            <Cross />
          </button>
        </div>
      </div>
      <div class={style.footer}/>
    </div>
  );
};
