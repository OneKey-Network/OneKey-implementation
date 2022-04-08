import { h } from 'preact';
import '@testing-library/jest-dom';
import { render, fireEvent, RenderResult, cleanup } from '@testing-library/preact';
import { OptionsGroup } from '../../src/components/forms/options-group/OptionsGroup';
import { Option } from '../../src/components/forms/option/Option';

describe('Options Group', () => {
  let renderResults: RenderResult;
  const onSelectMock = jest.fn();
  const options = [1, 2, 3];

  beforeEach(() => {
    renderResults = render(
      <OptionsGroup onSelectOption={onSelectMock}>
        {options.map((item) => (
          <Option testid={`option-${item}`} key={item} value={item.toString()}>
            option label {item.toString()}
          </Option>
        ))}
      </OptionsGroup>
    );
  });

  afterEach(() => {
    onSelectMock.mockClear();
    cleanup();
  });

  test('should render children', () => {
    expect(renderResults.queryAllByText(/option label \d/).length).toBe(3);
  });

  test('should select option', () => {
    options.forEach((item, index) => {
      const option = renderResults.getByTestId(`option-${item}`);
      fireEvent.click(option);
      expect(onSelectMock.mock.calls[index][0]).toBe(item.toString());
      expect(option).toHaveClass('active');
    });
  });
});
