'use client';

import { useLikedRealities } from '@/hooks/useLikedRealities';
import { useRealities } from '@/hooks/useRealities';
import type { RealityWithLikedUsers } from '@/types/reality.types';
import { FilterOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import { App, Button, Card, Empty, Input, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.scss';

const RealitiesPage = () => {
	const { realities, loading, error } = useRealities();
	const { isLiked, toggleLike, loading: likedLoading } = useLikedRealities();
	const { message } = App.useApp();

	// @NOTE: Filter state
	const [nameFilter, setNameFilter] = useState('');
	const [likedFilter, setLikedFilter] = useState<'all' | 'liked' | 'not-liked'>('all');

	// @NOTE: Pagination state
	const [currentPage, setCurrentPage] = useState(1);

	// @NOTE: Filtered data
	const filteredRealities = useMemo(() => {
		return realities.filter(reality => {
			// @NOTE: Name filter
			const matchesName = reality.name.toLowerCase().includes(nameFilter.toLowerCase());

			// @NOTE: Liked filter
			let matchesLiked = true;
			if (likedFilter === 'liked') {
				matchesLiked = isLiked(reality.id);
			} else if (likedFilter === 'not-liked') {
				matchesLiked = !isLiked(reality.id);
			}

			return matchesName && matchesLiked;
		});
	}, [realities, nameFilter, likedFilter, isLiked]);

	// @NOTE: Reset to first page when filters change
	// biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [nameFilter, likedFilter]);

	const handleLikeToggle = async (realityId: number) => {
		const success = await toggleLike(realityId);
		if (success) {
			const action = isLiked(realityId) ? 'unliked' : 'liked';
			message.success(`Reality ${action} successfully!`);
		} else {
			message.error('Failed to update like status');
		}
	};

	// @NOTE: Clear all filters
	const clearFilters = () => {
		setNameFilter('');
		setLikedFilter('all');
		setCurrentPage(1); // @NOTE: Reset to first page when clearing filters
	};

	const columns: ColumnsType<RealityWithLikedUsers> = [
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
			title: 'Liked by',
			key: 'likedBy',
			width: 200,
			render: (_, record) => {
				const likedUsers = record.liked.map(like => like.user.name);
				if (likedUsers.length === 0) {
					return <span style={{ color: '#999', fontStyle: 'italic' }}>No likes</span>;
				}
				if (likedUsers.length <= 2) {
					return <span>{likedUsers.join(', ')}</span>;
				}
				return (
					<span>
						{likedUsers.slice(0, 2).join(', ')} and {likedUsers.length - 2} more
					</span>
				);
			},
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
			<Card className={styles.tableCard}>
				<div className={styles.tableHeader}>
					<h2>Realities Data</h2>
					<p>Complete list of all available realities</p>
					{error && <p style={{ color: 'red', marginTop: '8px' }}>⚠️ {error}</p>}
				</div>

				{/* @NOTE: Filter Section */}
				<div className={styles.filterSection}>
					<Space wrap>
						<Input
							placeholder="Filter by name..."
							value={nameFilter}
							onChange={e => setNameFilter(e.target.value)}
							style={{ width: 200 }}
							allowClear
						/>
						<Select
							value={likedFilter}
							onChange={setLikedFilter}
							style={{ width: 150 }}
							options={[
								{ value: 'all', label: 'All Realities' },
								{ value: 'liked', label: 'Liked Only' },
								{ value: 'not-liked', label: 'Not Liked' },
							]}
						/>
						<Button
							icon={<FilterOutlined />}
							onClick={clearFilters}
							disabled={nameFilter === '' && likedFilter === 'all'}
						>
							Clear Filters
						</Button>
					</Space>
					{(nameFilter || likedFilter !== 'all') && (
						<div className={styles.filterInfo}>
							Showing {filteredRealities.length} of {realities.length} realities
						</div>
					)}
				</div>

				<Table
					columns={columns}
					dataSource={filteredRealities}
					loading={loading}
					rowKey="id"
					pagination={{
						current: currentPage,
						pageSize: 10,
						total: filteredRealities.length,
						showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
						onChange: page => {
							setCurrentPage(page);
						},
					}}
					locale={{
						emptyText: (
							<div style={{ padding: '40px 20px', textAlign: 'center' }}>
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									description={
										nameFilter || likedFilter !== 'all'
											? 'No realities match your filters'
											: 'No realities found'
									}
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
