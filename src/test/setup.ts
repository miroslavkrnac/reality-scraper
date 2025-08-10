import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';

// @NOTE: Make React available globally for JSX
global.React = React;

// @NOTE: Cleanup after each test case
afterEach(() => {
	cleanup();
});
