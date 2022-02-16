import { h } from 'preact';
import style from './style.scss';

interface ModalProps {
  maxWidth?: number;
  onClose: () => void;
  children?: JSX.Element | Array<JSX.Element>;
}

export const Modal = (props: ModalProps) => {
  const defaultMaxWidth = 400;
  return (
    <div class={style.modalContainer}>
      <div class={style.backdrop} />
      <div class={style.modal} style={{ maxWidth: props.maxWidth || defaultMaxWidth }}>
        <button class={style.closeBtn} onClick={() => props.onClose()}>
          &times;
        </button>
        {props.children}
      </div>
    </div>
  );
};
