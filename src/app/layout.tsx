import type { Metadata } from 'next';
import { ClientProviders } from './providers';
import './globals.scss';

export const metadata: Metadata = {
	title: 'Reality Scraper',
	description: 'A NextJS application for managing realities',
};

interface RootLayoutProps {
	children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
	<html lang="en">
		<body>
			<ClientProviders>{children}</ClientProviders>
		</body>
	</html>
);

// biome-ignore lint/style/noDefaultExport: Next.js requires default export for layouts
export default RootLayout;
