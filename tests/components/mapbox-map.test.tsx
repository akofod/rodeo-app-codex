import { render, screen } from '@testing-library/react';
import MapboxMap from '@/components/maps/MapboxMap';

describe('MapboxMap', () => {
  it('shows a token warning when missing Mapbox token', () => {
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    render(<MapboxMap markers={[]} />);
    expect(
      screen.getByText(/mapbox token is missing/i),
    ).toBeInTheDocument();
  });
});
