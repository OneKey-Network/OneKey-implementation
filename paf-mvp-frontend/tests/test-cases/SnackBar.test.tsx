import { h } from 'preact';
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, RenderResult } from '@testing-library/preact';
import { SnackBar } from '../../src/components/snack-bar/SnackBar';

describe('SnackBar component', () => {
  let renderResult: RenderResult;
  const onCloseMock = jest.fn();
  const testIcon = <i data-testid="test-icon">o</i>;

  afterEach(() => {
    cleanup();
    onCloseMock.mockClear();
  });

  beforeEach(() => {
    renderResult = render(<SnackBar icon={testIcon} title="title" message="Message" onClose={onCloseMock} />);
  });

  test('should render content', () => {
    expect(renderResult.getByTestId('notification-container')).toHaveClass('open');
    expect(renderResult.getByTestId('test-icon')).toBeInTheDocument();
    expect(renderResult.getByText('title')).toBeInTheDocument();
    expect(renderResult.getByText(/message/i)).toBeInTheDocument();
  });

  test('should emit close event', () => {
    jest.useFakeTimers();
    fireEvent.click(renderResult.getByTestId('notification-close-btn'));
    jest.runAllTimers();
    expect(onCloseMock.mock.calls.length).toBe(1);
    expect(renderResult.getByText(/message/i)).not.toHaveClass('open');
  });
});
