import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.scss';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
	{
		key: '/',
		label: <Link href="/">Home</Link>,
	},
	{
		key: '/realities',
		label: <Link href="/realities">Realities</Link>,
	},
];

export const Navigation = () => {
	const pathname = usePathname();

	return (
		<nav className={styles.navigation}>
			<div className="container">
				<Menu mode="horizontal" items={items} className={styles.menu} theme="light" selectedKeys={[pathname]} />
			</div>
		</nav>
	);
};
