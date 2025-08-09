'use client';

import { Card } from 'antd';
import styles from './page.module.scss';

const HomePage = () => (
	<div className="container">
		<div className="page-header">
			<h1>Reality Scraper</h1>
		</div>
		<Card className={styles.homepageCard}>
			<div className={styles.content}>
				<h2>Homepage</h2>
				<p>Welcome to the Reality Scraper application</p>
			</div>
		</Card>
	</div>
);

// biome-ignore lint/style/noDefaultExport: Next.js requires default export for pages
export default HomePage;
