import { HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, TableOutlined } from '@ant-design/icons';
import { Button, Menu } from 'antd';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Navigation.module.scss';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
	{
		key: '/',
		icon: <HomeOutlined />,
		label: <Link href="/">Home</Link>,
	},
	{
		key: '/realities',
		icon: <TableOutlined />,
		label: <Link href="/realities">Realities</Link>,
	},
];

export const Navigation = () => {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(true);

	const toggleCollapsed = () => {
		setCollapsed(!collapsed);
	};

	// @NOTE: Apply global class to body for main content adjustment
	useEffect(() => {
		const body = document.body;
		if (collapsed) {
			body.classList.add('sidebar-collapsed');
		} else {
			body.classList.remove('sidebar-collapsed');
		}

		return () => {
			body.classList.remove('sidebar-collapsed');
		};
	}, [collapsed]);

	return (
		<nav className={`${styles.navigation} ${collapsed ? styles.collapsed : ''}`}>
			<div className={styles.logoSection}>
				{!collapsed && <h2 className={styles.logo}>Reality Scraper</h2>}
				<Button
					type="text"
					icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
					onClick={toggleCollapsed}
					className={styles.collapseButton}
				/>
			</div>
			<Menu
				mode="inline"
				items={items}
				className={styles.menu}
				theme="light"
				selectedKeys={[pathname]}
				inlineCollapsed={collapsed}
			/>
		</nav>
	);
};
