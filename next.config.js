/** @type {import('next').NextConfig} */
const nextConfig = {
	sassOptions: {
		includePaths: ['./src/styles'],
	},
};

// biome-ignore lint/style/noDefaultExport: Next.js requires default export
module.exports = nextConfig;
