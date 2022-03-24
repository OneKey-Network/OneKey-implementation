import { h } from 'preact';
import { Fragment } from 'preact/compat';
import { Button } from '../button/Button';

import classes from './style.scss';
import layout from '../../styles/layouts.scss';

interface ISubPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  children: string | JSX.Element | Array<JSX.Element>;
}

export const SubPanel = ({ children, onClose, isOpen }: ISubPanelProps) => {
  return (
    <Fragment>
      {isOpen && <div class={classes.backdrop} onClick={() => onClose()} />}
      <div class={`${classes.container} ${isOpen ? classes.open : ''}`}>
        <div class={layout.justifyEnd}>
          <Button classList={classes.closeBtn} action={() => onClose()}>
            &#x203A;
          </Button>
        </div>
        <div class={classes.scroll}>{children}</div>
      </div>
    </Fragment>
  );
};
