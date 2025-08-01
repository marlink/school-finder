import React from 'react';
import { render, screen } from '@testing-library/react';
import Link from 'next/link';
import { Button } from '../button';

describe('Button', () => {
  it('renders a default button', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gradient-to-r from-orange-500 to-red-500');
  });

  it('renders a destructive button', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gradient-to-r from-red-500 to-red-600');
  });

  it('renders a disabled button', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  it('renders as a child component', () => {
    render(
      <Button asChild>
        <Link href="/">Link</Link>
      </Button>
    );
    const link = screen.getByRole('link', { name: /link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass('bg-gradient-to-r from-orange-500 to-red-500');
  });
});