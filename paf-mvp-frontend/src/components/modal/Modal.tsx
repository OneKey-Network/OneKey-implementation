import { h } from 'preact';
import style from './style.scss';
import grid from '../../styles/grid.scss';
import layout from '../../styles/layouts.scss';
import { Button } from '../button/Button';
import { Cross } from '../svg/cross/Cross';

interface ModalProps {
  maxWidth?: number;
  closeBtnText?: string;
  onClose: () => void;
  children?: JSX.Element | Array<JSX.Element>;
}

export const Modal = ({ children, maxWidth, onClose, closeBtnText = '' }: ModalProps) => {
  const defaultMaxWidth = 400;
  return (
    <div class={style.modalContainer}>
      <div class={style.backdrop} />
      <div class={style.modal} style={{ maxWidth: maxWidth || defaultMaxWidth }}>
        <div class={layout.justifyEnd}>
          <Button small accent action={() => onClose()}>
            <div class={layout.alignCenter}>
              <b class={grid['mr-2']}>{closeBtnText}</b>
              <Cross />
            </div>
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};
