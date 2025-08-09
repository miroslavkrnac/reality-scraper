'use client';

import { Navigation } from '@/components';
import { ConfigProvider } from 'antd';

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
		<Navigation />
		{children}
	</ConfigProvider>
);
