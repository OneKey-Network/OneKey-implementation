import { h } from 'preact';
import style from './style.scss';
import layout from '../../styles/layouts.scss';
import typography from '../../styles/typography.scss';

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
        <div class={layout.justifyEnd}>
          <button class={style.closeBtn} onClick={() => props.onClose()}>
            <span class={`${style.btnText} ${typography.textBold}`}>Close dialog</span>&times;
          </button>
        </div>
        {props.children}
      </div>
    </div>
  );
};
