import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the hero and quick search card', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: /find rodeos, jackpots, and western events/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /find events near your location/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search events/i })).toBeInTheDocument();
  });
});
