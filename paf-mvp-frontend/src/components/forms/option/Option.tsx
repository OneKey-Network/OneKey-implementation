import { h } from 'preact';
import { OptionGroupContext } from '../options-group/OptionsGroup';
import classes from './styles.scss';

interface OptionProps {
  children?: JSX.Element | Array<JSX.Element>;
  value: string;
  testid?: string;
}

export const Option = ({ children, value, testid }: OptionProps) => {
  return (
    <OptionGroupContext.Consumer>
      {({ selectedOption, updateState }) => (
        <label
          className={`${classes.option} ${selectedOption === value ? classes.active : ''}`}
          data-testid={testid}
          onClick={() => updateState(value)}
        >
          {children}
        </label>
      )}
    </OptionGroupContext.Consumer>
  );
};
