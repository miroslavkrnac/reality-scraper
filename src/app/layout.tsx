import { StyleRegistry } from '@/lib/StyleRegistry';
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
		<body className='sidebar-collapsed'>
			<StyleRegistry>
				<ClientProviders>
					<main>{children}</main>
				</ClientProviders>
			</StyleRegistry>
		</body>
	</html>
);

// biome-ignore lint/style/noDefaultExport: Next.js requires default export for layouts
export default RootLayout;
