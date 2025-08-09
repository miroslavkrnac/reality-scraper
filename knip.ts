const config = {
	entry: ['src/app/layout.tsx', 'src/app/page.tsx', 'src/app/**/page.tsx', 'src/app/**/route.ts'],
	project: ['src/**/*.{ts,tsx}'],
	ignore: [
		'**/*.test.{ts,tsx}',
		'**/*.spec.{ts,tsx}',
		'vitest.config.ts',
		'next.config.js',
		'tailwind.config.js',
		'postcss.config.js',
		'prisma/**/*',
	],
	ignoreDependencies: ['@types/*'],
	ignoreExportsUsedInFile: true,
	rules: {
		enumMembers: 'off',
	},
};

export default config;
