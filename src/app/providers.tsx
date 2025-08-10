'use client';

import { Navigation } from '@/components';
import { App, ConfigProvider } from 'antd';

interface ClientProvidersProps {
	children: React.ReactNode;
}

export const ClientProviders = ({ children }: ClientProvidersProps) => (
	<ConfigProvider
		theme={{
			token: {
				colorPrimary: '#1890ff',
			},
		}}
	>
		<App>
			<Navigation />
			{children}
		</App>
	</ConfigProvider>
);
