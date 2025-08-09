'use client';

import { useRealities } from '@/hooks/useRealities';
import type { Reality } from '@/types/reality.types';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from './page.module.scss';

const columns: ColumnsType<Reality> = [
	{
		title: 'ID',
		dataIndex: 'id',
		key: 'id',
		sorter: (a, b) => a.id - b.id,
		width: 100,
	},
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
		sorter: (a, b) => a.name.localeCompare(b.name),
	},
];

const RealitiesPage = () => {
	const { realities, loading, error } = useRealities();

	return (
		<div className="container">
			<div className="page-header">
				<h1>Realities Dashboard</h1>
			</div>
			<Card className={styles.tableCard}>
				<div className={styles.tableHeader}>
					<h2>Realities Data</h2>
					<p>Complete list of all available realities</p>
					{error && <p style={{ color: 'red', marginTop: '8px' }}>⚠️ {error}</p>}
				</div>
				<Table
					columns={columns}
					dataSource={realities}
					loading={loading}
					rowKey="id"
					pagination={{
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
					}}
					className={styles.table}
				/>
			</Card>
		</div>
	);
};

// biome-ignore lint/style/noDefaultExport: Next.js requires default export for pages
export default RealitiesPage;
