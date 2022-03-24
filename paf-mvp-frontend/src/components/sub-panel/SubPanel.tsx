import { h } from 'preact';
import { Fragment } from 'preact/compat';
import { Button } from '../button/Button';

import classes from './style.scss';
import layout from '../../styles/layouts.scss';
import { Cross } from '../svg/cross/Cross';

interface ISubPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  header?: string | JSX.Element | Array<JSX.Element>;
  children: string | JSX.Element | Array<JSX.Element>;
}

export const SubPanel = ({ children, onClose, isOpen, header }: ISubPanelProps) => {
  return (
    <Fragment>
      {isOpen && <div class={classes.backdrop} onClick={() => onClose()} />}
      <div class={`${classes.container} ${isOpen ? classes.open : ''}`}>
        <div class={layout.justifyEnd}>
          <Button accent action={() => onClose()}>
            <Cross />
          </Button>
        </div>
        {header}
        <div class={classes.scroll}>{children}</div>
      </div>
    </Fragment>
  );
};
