import { h } from 'preact';
import '@testing-library/jest-dom';
import { render, fireEvent, RenderResult, cleanup } from '@testing-library/preact';
import { Modal } from '../../src/components/modal/Modal';

describe('Modal', () => {
  let renderResult: RenderResult;
  const onCloseMock = jest.fn();

  beforeEach(() => {
    renderResult = render(
      <Modal onClose={onCloseMock} closeBtnText="close-btn">
        <div>children</div>
      </Modal>
    );
  });

  afterEach(() => {
    cleanup();
    onCloseMock.mockClear();
  });

  test('should render children', () => {
    expect(renderResult.getByText('children')).toBeInTheDocument();
  });

  test('should emit close event', () => {
    fireEvent.click(renderResult.getByText('close-btn'));
    expect(onCloseMock.mock.calls.length).toBe(1);
  });
});
