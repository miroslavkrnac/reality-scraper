import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from '../page';

describe('HomePage', () => {
	it('should render homepage content', () => {
		render(<HomePage />);

		expect(screen.getByText('Homepage')).toBeInTheDocument();
	});

	it('should render with proper styling', () => {
		render(<HomePage />);

		const container = screen.getByText('Homepage').closest('.container');
		expect(container).toBeInTheDocument();
	});
});
