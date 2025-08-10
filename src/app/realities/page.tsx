'use client';

import { useLikedRealities } from '@/hooks/useLikedRealities';
import { useRealities } from '@/hooks/useRealities';
import type { Reality } from '@/types/reality.types';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { App, Button, Card, Empty, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from './page.module.scss';

const RealitiesPage = () => {
	const { realities, loading, error } = useRealities();
	const { isLiked, toggleLike, loading: likedLoading } = useLikedRealities();
	const { message } = App.useApp();

	const handleLikeToggle = async (realityId: number) => {
		const success = await toggleLike(realityId);
		if (success) {
			const action = isLiked(realityId) ? 'unliked' : 'liked';
			message.success(`Reality ${action} successfully!`);
		} else {
			message.error('Failed to update like status');
		}
	};

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
		{
			title: 'Actions',
			key: 'actions',
			width: 100,
			render: (_, record) => (
				<Button
					type="text"
					icon={isLiked(record.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
					onClick={() => handleLikeToggle(record.id)}
					loading={likedLoading}
					className={styles.actionButton}
				/>
			),
		},
	];

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
					locale={{
						emptyText: (
							<div style={{ padding: '40px 20px', textAlign: 'center' }}>
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									description="No realities found"
									style={{ margin: 0 }}
								/>
							</div>
						),
					}}
					className={styles.table}
				/>
			</Card>
		</div>
	);
};

// biome-ignore lint/style/noDefaultExport: Next.js requires default export for pages
export default RealitiesPage;
