import { h } from 'preact';
import { Fragment } from 'preact/compat';
import { Button } from '../button/Button';

import classes from './style.scss';
import layout from '../../styles/layouts.scss';
import { Cross } from '../svg/cross/Cross';
import { useEffect, useState } from 'preact/hooks';

interface ISubPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  header?: string | JSX.Element | Array<JSX.Element>;
  children: string | JSX.Element | Array<JSX.Element>;
}

export const SubPanel = ({ children, onClose, isOpen, header }: ISubPanelProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSlideUp, setIsSlideUp] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsSlideUp(true), 50);
    }
  }, [isOpen]);
  const closeFn = () => {
    onClose();
    setIsSlideUp(false);
    setTimeout(() => setIsVisible(false), 200);
  };
  return (
    <Fragment>
      {isOpen && <div class={classes.backdrop} onClick={() => closeFn()} />}
      <div class={`${classes.container} ${isSlideUp ? classes.open : ''} ${isVisible ? classes.isVisible : ''}`}>
        <div class={layout.justifyEnd}>
          <Button accent action={() => closeFn()} testid="close-panel-btn">
            <Cross />
          </Button>
        </div>
        {header}
        <div class={classes.scroll}>{children}</div>
      </div>
    </Fragment>
  );
};
