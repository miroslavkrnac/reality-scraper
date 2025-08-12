'use client';

import { Navigation } from '@/components';
import { App, ConfigProvider } from 'antd';
import { useEffect, useState } from 'react';

interface ClientProvidersProps {
	children: React.ReactNode;
}

export const ClientProviders = ({ children }: ClientProvidersProps) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<ConfigProvider
			theme={{
				token: {
					colorPrimary: '#1890ff',
				},
			}}
		>
			<App>
				{mounted && <Navigation />}
				{children}
			</App>
		</ConfigProvider>
	);
};
