import { render, screen } from '@testing-library/react';
import EventForm from '@/app/(dashboard)/dashboard/events/EventForm';

describe('EventForm', () => {
  it('renders basic fields', () => {
    render(<EventForm venues={[]} disciplines={[]} sanctioningBodies={[]} />);
    expect(screen.getByRole('button', { name: /submit event/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
  });
});
