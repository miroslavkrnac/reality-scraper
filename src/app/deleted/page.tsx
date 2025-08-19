'use client';

import { useDeletedRealities } from '@/hooks/useDeletedRealities';
import type { Reality, RealityType } from '@/types/reality.types';
import { restoreReality } from '@/utils/deleted.utils';
import { FilterOutlined, UndoOutlined } from '@ant-design/icons';
import { App, Button, Card, Empty, Input, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.scss';

const { Text } = Typography;

const DeletedRealitiesPage = () => {
	const { deletedRealities, loading, error, mutate } = useDeletedRealities();
	const { message } = App.useApp();

	// @NOTE: Filter state
	const [nameFilter, setNameFilter] = useState('');
	const [typeFilter, setTypeFilter] = useState<'all' | RealityType>('all');

	// @NOTE: Pagination state
	const [currentPage, setCurrentPage] = useState(1);

	// @NOTE: Restore loading state
	const [restoreLoading, setRestoreLoading] = useState(false);

	// @NOTE: Filtered data
	const filteredDeletedRealities = useMemo(() => {
		return deletedRealities.filter(reality => {
			// @NOTE: Title filter
			const matchesTitle = reality.title.toLowerCase().includes(nameFilter.toLowerCase());

			// @NOTE: Type filter
			const matchesType = typeFilter === 'all' || reality.type === typeFilter;

			return matchesTitle && matchesType;
		});
	}, [deletedRealities, nameFilter, typeFilter]);

	// @NOTE: Reset to first page when filters change
	// biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [nameFilter, typeFilter]);

	// @NOTE: Handle restore reality
	const handleRestoreReality = async (realityId: number) => {
		setRestoreLoading(true);
		const success = await restoreReality(realityId);
		setRestoreLoading(false);

		if (success) {
			message.success('Reality restored successfully!');
			// @NOTE: Refresh the data after successful restore
			mutate();
		} else {
			message.error('Failed to restore reality');
		}
	};

	// @NOTE: Clear all filters
	const clearFilters = () => {
		setNameFilter('');
		setTypeFilter('all');
		setCurrentPage(1); // @NOTE: Reset to first page when clearing filters
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
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			sorter: (a, b) => a.title.localeCompare(b.title),
		},
		{
			title: 'Location',
			dataIndex: 'location',
			key: 'location',
			sorter: (a, b) => a.location.localeCompare(b.location),
		},
		{
			title: 'Price',
			dataIndex: 'price',
			key: 'price',
			sorter: (a, b) => a.price.localeCompare(b.price),
		},
		{
			title: 'Type',
			dataIndex: 'type',
			key: 'type',
			width: 150,
			render: (type: RealityType) => {
				const typeLabels = {
					FLAT_PERSONAL: 'Flat Personal',
					FLAT_INVESTMENT: 'Flat Investment',
					LAND_PERSONAL: 'Land Personal',
					LAND_INVESTMENT: 'Land Investment',
					OTHER: 'Other',
				};
				return typeLabels[type];
			},
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 120,
			render: (_, record) => (
				<Space>
					<Button
						type="text"
						icon={<UndoOutlined style={{ color: '#1890ff' }} />}
						onClick={() => handleRestoreReality(record.id)}
						loading={restoreLoading}
						className={styles.actionButton}
						title="Restore reality"
					/>
				</Space>
			),
		},
	];

	if (error) {
		return (
			<div className="container">
				<Card>
					<div style={{ textAlign: 'center', padding: '40px 20px' }}>
						<Text type="danger" style={{ fontSize: '16px' }}>
							⚠️ {error}
						</Text>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="container">
			<Card className={styles.tableCard}>
				<div className={styles.tableHeader}>
					<h2>Deleted Realities</h2>
					<p>List of all deleted realities that can be restored</p>
				</div>

				<div className={styles.filterSection}>
					<Space wrap>
						<Input
							placeholder="Filter by title..."
							value={nameFilter}
							onChange={e => setNameFilter(e.target.value)}
							style={{ width: 200 }}
							allowClear
						/>
						<Select
							value={typeFilter}
							onChange={setTypeFilter}
							style={{ width: 180 }}
							options={[
								{ value: 'all', label: 'All Types' },
								{ value: 'FLAT_PERSONAL', label: 'Flat Personal' },
								{ value: 'FLAT_INVESTMENT', label: 'Flat Investment' },
								{ value: 'LAND_PERSONAL', label: 'Land Personal' },
								{ value: 'LAND_INVESTMENT', label: 'Land Investment' },
								{ value: 'OTHER', label: 'Other' },
							]}
						/>
						<Button
							icon={<FilterOutlined />}
							onClick={clearFilters}
							disabled={nameFilter === '' && typeFilter === 'all'}
						>
							Clear Filters
						</Button>
					</Space>
					{(nameFilter || typeFilter !== 'all') && (
						<div className={styles.filterInfo}>
							Showing {filteredDeletedRealities.length} of {deletedRealities.length} deleted realities
						</div>
					)}
				</div>

				<Table
					columns={columns}
					dataSource={filteredDeletedRealities}
					loading={loading}
					rowKey="id"
					pagination={{
						current: currentPage,
						pageSize: 10,
						total: filteredDeletedRealities.length,
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
										nameFilter || typeFilter !== 'all'
											? 'No deleted realities match your filters'
											: 'No deleted realities found'
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
export default DeletedRealitiesPage;
