import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom';

// @NOTE: Make React available globally for JSX
global.React = React;

// @NOTE: Cleanup after each test case
afterEach(() => {
	cleanup();
});
