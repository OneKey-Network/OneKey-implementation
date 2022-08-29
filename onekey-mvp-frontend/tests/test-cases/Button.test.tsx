import { h } from 'preact';
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, RenderResult } from '@testing-library/preact';
import { Button } from '../../src/components/button/Button';

describe('Button Component', () => {
  const innerText = 'Perfect Button';
  const actionStub = jest.fn();
  let testUtils: RenderResult;

  beforeEach(() => {
    testUtils = render(<Button action={actionStub}>{innerText}</Button>);
  });

  afterEach(() => {
    cleanup();
    actionStub.mockClear();
  });

  test('Should render content', () => {
    const button = testUtils.queryByText(innerText);

    expect(button).toBeInTheDocument();
  });

  test('should emit action on click', () => {
    const button = testUtils.queryByText(innerText);

    fireEvent.click(button);
    expect(actionStub.mock.calls.length).toBe(1);
  });
});
