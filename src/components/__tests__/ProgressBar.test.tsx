import { render } from '@testing-library/react';
import ProgressBar from '@/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct width', () => {
    const { container } = render(<ProgressBar value={50} />);
    const inner = container.querySelector('div > div');
    expect(inner).toBeTruthy();
    expect((inner as HTMLElement).style.width).toBe('50%');
  });

  it('clamps values and displays 0%', () => {
    const { container } = render(<ProgressBar value={-10} />);
    const inner = container.querySelector('div > div');
    expect((inner as HTMLElement).style.width).toBe('0%');
  });

  it('renders 25%, 75%, 100%', () => {
    const v = [25, 75, 100];
    v.forEach(val => {
      const { container } = render(<ProgressBar value={val} />);
      const inner = container.querySelector('div > div');
      expect((inner as HTMLElement).style.width).toBe(`${val}%`);
    });
  });
});