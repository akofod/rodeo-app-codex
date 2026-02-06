import { render, screen } from '@testing-library/react';
import HeaderNav from '@/components/HeaderNav';

describe('HeaderNav', () => {
  it('renders dashboard first for authenticated users', () => {
    const { container } = render(
      <HeaderNav isAuthenticated userInitial="A" onSignOut={() => undefined} />,
    );

    const markup = container.innerHTML;
    expect(markup.indexOf('Dashboard')).toBeGreaterThan(-1);
    expect(markup.indexOf('Dashboard')).toBeLessThan(markup.indexOf('Events'));
  });

  it('renders sign in link for guests', () => {
    render(<HeaderNav isAuthenticated={false} userInitial="A" onSignOut={() => undefined} />);
    expect(screen.getAllByRole('link', { name: /sign in/i }).length).toBeGreaterThan(0);
  });
});
