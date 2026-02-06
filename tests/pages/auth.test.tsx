import { render, screen } from '@testing-library/react';
import AuthLayout from '@/app/(auth)/layout';
import SignInPage from '@/app/(auth)/sign-in/page';
import SignUpPage from '@/app/(auth)/sign-up/page';

describe('Auth pages', () => {
  it('renders auth layout', () => {
    render(
      <AuthLayout>
        <div>Child content</div>
      </AuthLayout>,
    );

    expect(screen.getByRole('heading', { name: /join the western sports hub/i })).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders sign in form', () => {
    render(<SignInPage />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders sign up form', () => {
    render(<SignUpPage />);
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });
});
