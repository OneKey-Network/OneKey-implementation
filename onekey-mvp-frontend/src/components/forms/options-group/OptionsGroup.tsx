import { h } from 'preact';
import { createContext, StateUpdater, useState } from 'preact/compat';

interface OptionsGroupProps {
  children?: JSX.Element | Array<JSX.Element>;
  selected?: string | boolean;
  onSelectOption: (option: string | boolean) => void;
}

interface IOptionGroupContext {
  selectedOption: string | boolean;
  updateState: StateUpdater<string | true>;
}

export const OptionGroupContext = createContext<IOptionGroupContext>({
  selectedOption: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateState: () => {},
});

export const OptionsGroup = ({ children, onSelectOption, selected }: OptionsGroupProps) => {
  const [selectedOption, setSelected] = useState(selected);
  const updateState = (value: string) => {
    setSelected(value);
    onSelectOption(value);
  };

  return <OptionGroupContext.Provider value={{ selectedOption, updateState }}>{children}</OptionGroupContext.Provider>;
};
