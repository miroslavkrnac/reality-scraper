'use client';

import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs';
import { useServerInsertedHTML } from 'next/navigation';
import type React from 'react';

export const StyleRegistry = ({ children }: { children: React.ReactNode }) => {
	const cache = createCache();

	useServerInsertedHTML(() => {
		const styleText = extractStyle(cache, true);
		// biome-ignore lint/security/noDangerouslySetInnerHtml: Required for Ant Design SSR style injection
		return <style dangerouslySetInnerHTML={{ __html: styleText }} />;
	});

	return (
		<StyleProvider cache={cache} hashPriority="high">
			{children}
		</StyleProvider>
	);
};
