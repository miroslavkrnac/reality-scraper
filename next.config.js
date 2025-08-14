/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	sassOptions: {
		includePaths: ['./src/styles'],
	},
	// @NOTE: Enable standalone output for optimized Docker builds
	output: 'standalone',
};

// biome-ignore lint/style/noDefaultExport: Next.js requires default export
module.exports = nextConfig;
