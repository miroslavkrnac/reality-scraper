'use client';

import { useLikedRealities } from '@/hooks/useLikedRealities';
import { useRealities } from '@/hooks/useRealities';
import type { RealityType, RealityWithLikedUsers } from '@/types/reality.types';
import { EyeOutlined, FilterOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import { App, Button, Card, Empty, Input, Modal, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.scss';

const { Title, Text } = Typography;

const RealitiesPage = () => {
	const { realities, loading, error } = useRealities();
	const { isLiked, toggleLike, loading: likedLoading } = useLikedRealities();
	const { message } = App.useApp();

	// @NOTE: Filter state
	const [nameFilter, setNameFilter] = useState('');
	const [likedFilter, setLikedFilter] = useState<'all' | 'liked' | 'not-liked'>('all');
	const [typeFilter, setTypeFilter] = useState<'all' | RealityType>('all');

	// @NOTE: Pagination state
	const [currentPage, setCurrentPage] = useState(1);

	// @NOTE: Modal state
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedReality, setSelectedReality] = useState<RealityWithLikedUsers | null>(null);

	// @NOTE: Filtered data
	const filteredRealities = useMemo(() => {
		return realities.filter(reality => {
			// @NOTE: Title filter (replaces name filter)
			const matchesTitle = reality.title.toLowerCase().includes(nameFilter.toLowerCase());

			// @NOTE: Liked filter
			let matchesLiked = true;
			if (likedFilter === 'liked') {
				matchesLiked = isLiked(reality.id);
			} else if (likedFilter === 'not-liked') {
				matchesLiked = !isLiked(reality.id);
			}

			// @NOTE: Type filter
			const matchesType = typeFilter === 'all' || reality.type === typeFilter;

			return matchesTitle && matchesLiked && matchesType;
		});
	}, [realities, nameFilter, likedFilter, typeFilter, isLiked]);

	// @NOTE: Reset to first page when filters change
	// biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [nameFilter, likedFilter, typeFilter]);

	const handleLikeToggle = async (realityId: number) => {
		const success = await toggleLike(realityId);
		if (success) {
			const action = isLiked(realityId) ? 'unliked' : 'liked';
			message.success(`Reality ${action} successfully!`);
		} else {
			message.error('Failed to update like status');
		}
	};

	// @NOTE: Handle view reality details
	const handleViewReality = (reality: RealityWithLikedUsers) => {
		setSelectedReality(reality);
		setIsModalVisible(true);
	};

	// @NOTE: Handle modal close
	const handleModalClose = () => {
		setIsModalVisible(false);
		setSelectedReality(null);
	};

	// @NOTE: Handle like toggle in modal
	const handleModalLikeToggle = async () => {
		if (!selectedReality) {
			return;
		}

		const success = await toggleLike(selectedReality.id);
		if (success) {
			const action = isLiked(selectedReality.id) ? 'unliked' : 'liked';
			message.success(`Reality ${action} successfully!`);
		} else {
			message.error('Failed to update like status');
		}
	};

	// @NOTE: Clear all filters
	const clearFilters = () => {
		setNameFilter('');
		setLikedFilter('all');
		setTypeFilter('all');
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
				};
				return typeLabels[type];
			},
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
			width: 150,
			render: (_, record) => (
				<Space>
					<Button
						type="text"
						icon={<EyeOutlined />}
						onClick={() => handleViewReality(record)}
						className={styles.actionButton}
						title="View details"
					/>
					<Button
						type="text"
						icon={isLiked(record.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
						onClick={() => handleLikeToggle(record.id)}
						loading={likedLoading}
						className={styles.actionButton}
						title={isLiked(record.id) ? 'Unlike' : 'Like'}
					/>
				</Space>
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
							placeholder="Filter by title..."
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
							]}
						/>
						<Button
							icon={<FilterOutlined />}
							onClick={clearFilters}
							disabled={nameFilter === '' && likedFilter === 'all' && typeFilter === 'all'}
						>
							Clear Filters
						</Button>
					</Space>
					{(nameFilter || likedFilter !== 'all' || typeFilter !== 'all') && (
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
										nameFilter || likedFilter !== 'all' || typeFilter !== 'all'
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

			{/* @NOTE: Reality Details Modal */}
			<Modal title="Reality Details" open={isModalVisible} onCancel={handleModalClose} footer={false} width={600}>
				{selectedReality && (
					<div className={styles.modalContent}>
						{selectedReality.img_src && (
							<div className={styles.modalSection}>
								<Title level={4}>Property Image</Title>
								<div style={{ textAlign: 'center' }}>
									<img
										src={selectedReality.img_src}
										alt={selectedReality.title}
										style={{
											maxWidth: '100%',
											maxHeight: '300px',
											borderRadius: '8px',
											boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
										}}
									/>
								</div>
							</div>
						)}

						<div className={styles.modalSection}>
							<Title level={4}>Title</Title>
							<Text>{selectedReality.title}</Text>
						</div>

						<div className={styles.modalSection}>
							<Title level={4}>Location</Title>
							<Text>{selectedReality.location}</Text>
						</div>

						<div className={styles.modalSection}>
							<Title level={4}>Price</Title>
							<Text>{selectedReality.price}</Text>
						</div>

						<div className={styles.modalSection}>
							<Title level={4}>ID</Title>
							<Text>{selectedReality.id}</Text>
						</div>

						<div className={styles.modalSection}>
							<Title level={4}>Reality ID</Title>
							<Text>{selectedReality.reality_id}</Text>
						</div>

						<div className={styles.modalSection}>
							<Title level={4}>Type</Title>
							<Text>
								{(() => {
									const typeLabels = {
										FLAT_PERSONAL: 'Flat Personal',
										FLAT_INVESTMENT: 'Flat Investment',
										LAND_PERSONAL: 'Land Personal',
										LAND_INVESTMENT: 'Land Investment',
									};
									return typeLabels[selectedReality.type];
								})()}
							</Text>
						</div>

						<div className={styles.modalSection}>
							<Title level={4}>Property Details</Title>
							<div style={{ textAlign: 'center', padding: '20px' }}>
								<Button
									type="primary"
									size="large"
									icon={<EyeOutlined />}
									onClick={() =>
										window.open(
											`https://www.sreality.cz${selectedReality.link}`,
											'_blank',
											'noopener,noreferrer',
										)
									}
								>
									View Property on Sreality.cz
								</Button>
								<div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
									Opens in a new tab
								</div>
							</div>
						</div>

						<div className={styles.modalSection}>
							<Title level={4}>Actions</Title>
							<Button
								type="primary"
								icon={isLiked(selectedReality.id) ? <HeartFilled /> : <HeartOutlined />}
								onClick={handleModalLikeToggle}
								loading={likedLoading}
								style={{
									backgroundColor: isLiked(selectedReality.id) ? '#ff4d4f' : undefined,
									borderColor: isLiked(selectedReality.id) ? '#ff4d4f' : undefined,
								}}
							>
								{isLiked(selectedReality.id) ? 'Unlike' : 'Like'}
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
};

// biome-ignore lint/style/noDefaultExport: Next.js requires default export for pages
export default RealitiesPage;
