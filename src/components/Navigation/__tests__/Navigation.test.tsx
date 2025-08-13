import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Navigation } from '../Navigation';

// @NOTE: Create a global mock function that can be accessed in tests
const mockUsePathname = vi.hoisted(() => vi.fn());

// @NOTE: Mock Next.js navigation
vi.mock('next/navigation', () => ({
	usePathname: mockUsePathname,
}));

describe('Navigation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUsePathname.mockReturnValue('/');
	});

	it('should render navigation with collapsed state by default', () => {
		render(<Navigation />);

		expect(screen.queryByText('Reality Scraper')).not.toBeInTheDocument(); // @NOTE: Hidden when collapsed
		expect(screen.getByRole('button')).toBeInTheDocument(); // @NOTE: Collapse button
	});

	it('should expand navigation when collapse button is clicked', () => {
		render(<Navigation />);

		const collapseButton = screen.getByRole('button');
		fireEvent.click(collapseButton);

		expect(screen.getByText('Reality Scraper')).toBeInTheDocument();
	});

	it('should show correct active menu item based on pathname', () => {
		mockUsePathname.mockReturnValue('/realities');

		render(<Navigation />);

		const realitiesMenuItem = screen.getByText('Realities');
		expect(realitiesMenuItem.closest('.ant-menu-item-selected')).toBeInTheDocument();
	});

	it('should render all navigation links', () => {
		render(<Navigation />);

		expect(screen.getByText('Realities')).toBeInTheDocument();
	});

	it('should toggle collapse state correctly', () => {
		render(<Navigation />);

		const collapseButton = screen.getByRole('button');

		// @NOTE: Initially collapsed
		expect(screen.queryByText('Reality Scraper')).not.toBeInTheDocument();

		// @NOTE: Expand
		fireEvent.click(collapseButton);
		expect(screen.getByText('Reality Scraper')).toBeInTheDocument();

		// @NOTE: Collapse again
		fireEvent.click(collapseButton);
		expect(screen.queryByText('Reality Scraper')).not.toBeInTheDocument();
	});

	it('should apply sidebar-collapsed class to body when collapsed', () => {
		render(<Navigation />);

		expect(document.body.classList.contains('sidebar-collapsed')).toBe(true);
	});
});
