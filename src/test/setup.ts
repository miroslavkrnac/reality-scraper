import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// @NOTE: Cleanup after each test case
afterEach(() => {
	cleanup();
});
