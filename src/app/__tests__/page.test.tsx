import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// @NOTE: Mock the redirect function to prevent actual redirects during testing
vi.mock('next/navigation', () => ({
	redirect: vi.fn(),
}));

import HomePage from '../page';

describe('HomePage', () => {
	it('should render without errors', () => {
		expect(() => render(<HomePage />)).not.toThrow();
	});
});
