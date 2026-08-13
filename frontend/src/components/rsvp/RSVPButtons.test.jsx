import { render, screen, fireEvent } from '@testing-library/react';
import RSVPButtons from './RSVPButtons';

describe('RSVPButtons', () => {
  test('renders all three response options', () => {
    render(<RSVPButtons value={null} onSelect={() => {}} />);
    expect(screen.getByText('Going')).toBeInTheDocument();
    expect(screen.getByText('Maybe')).toBeInTheDocument();
    expect(screen.getByText('Not Going')).toBeInTheDocument();
  });

  test('calls onSelect with the chosen response', () => {
    const onSelect = jest.fn();
    render(<RSVPButtons value={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Maybe'));
    expect(onSelect).toHaveBeenCalledWith('maybe');
  });

  test('disables Going when the event is full and not already going', () => {
    const onSelect = jest.fn();
    render(<RSVPButtons value={null} onSelect={onSelect} fullForGoing />);
    const goingBtn = screen.getByText('Going').closest('button');
    expect(goingBtn).toBeDisabled();
  });

  test('allows keeping Going even when full if already going', () => {
    const onSelect = jest.fn();
    render(<RSVPButtons value="going" onSelect={onSelect} fullForGoing />);
    const goingBtn = screen.getByText('Going').closest('button');
    expect(goingBtn).not.toBeDisabled();
  });
});
