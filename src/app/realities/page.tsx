'use client';

import { useRealities } from '@/hooks/useRealities';
import type { Reality, RealityType } from '@/types/reality.types';
import {
	calculatePricePerM2,
	deleteReality,
	formatPricePerM2,
	generateMapsUrl,
	toggleLike,
} from '@/utils/reality.utils';
import { DeleteOutlined, EyeOutlined, FilterOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import { App, Button, Card, Empty, Input, Modal, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './page.module.scss';

const { Title, Text } = Typography;

const RealitiesPage = () => {
	const { realities, loading, error, mutate } = useRealities();
	const { message } = App.useApp();

	// @NOTE: Filter state
	const [nameFilter, setNameFilter] = useState('');
	const [typeFilter, setTypeFilter] = useState<'all' | RealityType>('all');
	const [likedFilter, setLikedFilter] = useState<'all' | 'liked' | 'not-liked'>('all');

	// @NOTE: Pagination state
	const [currentPage, setCurrentPage] = useState(1);

	// @NOTE: Modal state
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedReality, setSelectedReality] = useState<Reality | null>(null);

	// @NOTE: Delete confirmation modal state
	const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
	const [realityToDelete, setRealityToDelete] = useState<Reality | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	// @NOTE: Like toggle loading state
	const [likeLoading, setLikeLoading] = useState(false);

	// @NOTE: Check if a reality is liked based on the reality data
	const isLiked = useCallback(
		(realityId: number): boolean => {
			const reality = realities.find(r => r.id === realityId);
			return reality?.liked || false;
		},
		[realities],
	);

	// @NOTE: Filtered data
	const filteredRealities = useMemo(() => {
		return realities.filter(reality => {
			// @NOTE: Title filter (replaces name filter)
			const matchesTitle = reality.title.toLowerCase().includes(nameFilter.toLowerCase());

			// @NOTE: Type filter
			const matchesType = typeFilter === 'all' || reality.type === typeFilter;

			// @NOTE: Liked filter
			const matchesLiked =
				likedFilter === 'all' ||
				(likedFilter === 'liked' && reality.liked) ||
				(likedFilter === 'not-liked' && !reality.liked);

			return matchesTitle && matchesType && matchesLiked;
		});
	}, [realities, nameFilter, typeFilter, likedFilter]);

	// @NOTE: Reset to first page when filters change
	// biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [nameFilter, typeFilter, likedFilter]);

	const handleLikeToggle = async (realityId: number) => {
		setLikeLoading(true);
		const success = await toggleLike(realityId);
		setLikeLoading(false);

		if (success) {
			const action = isLiked(realityId) ? 'unliked' : 'liked';
			message.success(`Reality ${action} successfully!`);
			// @NOTE: Refresh the data after successful like toggle
			mutate();
		} else {
			message.error('Failed to update like status');
		}
	};

	// @NOTE: Handle view reality details
	const handleViewReality = (reality: Reality) => {
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

		setLikeLoading(true);
		const success = await toggleLike(selectedReality.id);
		setLikeLoading(false);

		if (success) {
			const action = isLiked(selectedReality.id) ? 'unliked' : 'liked';
			message.success(`Reality ${action} successfully!`);
			// @NOTE: Refresh the data after successful like toggle
			mutate();
		} else {
			message.error('Failed to update like status');
		}
	};

	// @NOTE: Handle delete reality
	const handleDeleteReality = (reality: Reality) => {
		setRealityToDelete(reality);
		setIsDeleteModalVisible(true);
	};

	// @NOTE: Handle delete confirmation
	const handleDeleteConfirm = async () => {
		if (!realityToDelete) {
			return;
		}

		setDeleteLoading(true);
		const success = await deleteReality(realityToDelete.id);
		setDeleteLoading(false);

		if (success) {
			message.success('Reality deleted successfully!');
			setIsDeleteModalVisible(false);
			setRealityToDelete(null);
			// @NOTE: Refresh the realities data without reloading the page
			mutate();
		} else {
			message.error('Failed to delete reality');
		}
	};

	// @NOTE: Handle delete modal close
	const handleDeleteModalClose = () => {
		setIsDeleteModalVisible(false);
		setRealityToDelete(null);
	};

	// @NOTE: Clear all filters
	const clearFilters = () => {
		setNameFilter('');
		setTypeFilter('all');
		setLikedFilter('all');
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
			render: (location: string) => (
				<a
					href={generateMapsUrl(location)}
					target="_blank"
					rel="noopener noreferrer"
					style={{ color: '#1890ff' }}
				>
					{location}
				</a>
			),
		},
		{
			title: 'Price',
			dataIndex: 'price',
			key: 'price',
			sorter: (a, b) => a.price.localeCompare(b.price),
		},
		{
			title: 'Price per m²',
			key: 'pricePerM2',
			width: 140,
			render: (_, record) => {
				const pricePerM2 = calculatePricePerM2(record.price, record.title);
				return formatPricePerM2(pricePerM2);
			},
			sorter: (a, b) => {
				const pricePerM2A = calculatePricePerM2(a.price, a.title) || 0;
				const pricePerM2B = calculatePricePerM2(b.price, b.title) || 0;
				return pricePerM2A - pricePerM2B;
			},
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
			width: 200,
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
						icon={record.liked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
						onClick={() => handleLikeToggle(record.id)}
						loading={likeLoading}
						className={styles.actionButton}
						title={record.liked ? 'Unlike' : 'Like'}
					/>
					<Button
						type="text"
						icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
						onClick={() => handleDeleteReality(record)}
						className={styles.actionButton}
						title="Delete reality"
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

						<Select
							value={likedFilter}
							onChange={setLikedFilter}
							style={{ width: 150 }}
							options={[
								{ value: 'all', label: 'All' },
								{ value: 'liked', label: 'Liked Only' },
								{ value: 'not-liked', label: 'Not Liked' },
							]}
						/>

						<Button
							icon={<FilterOutlined />}
							onClick={clearFilters}
							disabled={nameFilter === '' && typeFilter === 'all' && likedFilter === 'all'}
						>
							Clear Filters
						</Button>
					</Space>
					{(nameFilter || typeFilter !== 'all' || likedFilter !== 'all') && (
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
										nameFilter || typeFilter !== 'all'
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
			<Modal title="Reality Details" open={isModalVisible} onCancel={handleModalClose} footer={false} width={800}>
				{selectedReality && (
					<div className={styles.modalContent}>
						{/* @NOTE: Image Section - Full Width */}
						{selectedReality.img_src && (
							<div className={styles.modalSection}>
								<div style={{ textAlign: 'center' }}>
									<img
										src={selectedReality.img_src}
										alt={selectedReality.title}
										style={{
											maxWidth: '100%',
											maxHeight: '350px',
											borderRadius: '12px',
											boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
										}}
									/>
								</div>
							</div>
						)}

						{/* @NOTE: Main Content - Two Columns */}
						<div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
							{/* @NOTE: Left Column - Property Details */}
							<div style={{ flex: 1 }}>
								<div className={styles.modalSection}>
									<Title level={4} style={{ marginBottom: '16px', color: '#1890ff' }}>
										Property Information
									</Title>

									<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												padding: '12px',
												backgroundColor: '#f8f9fa',
												borderRadius: '8px',
											}}
										>
											<Text strong style={{ color: '#666' }}>
												Title:
											</Text>
											<Text style={{ textAlign: 'right', maxWidth: '60%' }}>
												{selectedReality.title}
											</Text>
										</div>

										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												padding: '12px',
												backgroundColor: '#f8f9fa',
												borderRadius: '8px',
											}}
										>
											<Text strong style={{ color: '#666' }}>
												Location:
											</Text>
											<div style={{ textAlign: 'right', maxWidth: '60%' }}>
												<a
													href={generateMapsUrl(selectedReality.location)}
													target="_blank"
													rel="noopener noreferrer"
													style={{ color: '#1890ff', textDecoration: 'none' }}
													onMouseEnter={e => {
														e.currentTarget.style.textDecoration = 'underline';
													}}
													onMouseLeave={e => {
														e.currentTarget.style.textDecoration = 'none';
													}}
												>
													{selectedReality.location}
												</a>
											</div>
										</div>

										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												padding: '12px',
												backgroundColor: '#f8f9fa',
												borderRadius: '8px',
											}}
										>
											<Text strong style={{ color: '#666' }}>
												Price:
											</Text>
											<Text
												strong
												style={{ textAlign: 'right', color: '#52c41a', fontSize: '16px' }}
											>
												{selectedReality.price}
											</Text>
										</div>

										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												padding: '12px',
												backgroundColor: '#f8f9fa',
												borderRadius: '8px',
											}}
										>
											<Text strong style={{ color: '#666' }}>
												Price per m²:
											</Text>
											<Text
												strong
												style={{ textAlign: 'right', color: '#1890ff', fontSize: '16px' }}
											>
												{formatPricePerM2(
													calculatePricePerM2(selectedReality.price, selectedReality.title),
												)}
											</Text>
										</div>

										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												padding: '12px',
												backgroundColor: '#f8f9fa',
												borderRadius: '8px',
											}}
										>
											<Text strong style={{ color: '#666' }}>
												Type:
											</Text>
											<Text style={{ textAlign: 'right' }}>
												{(() => {
													const typeLabels = {
														FLAT_PERSONAL: 'Flat Personal',
														FLAT_INVESTMENT: 'Flat Investment',
														LAND_PERSONAL: 'Land Personal',
														LAND_INVESTMENT: 'Land Investment',
														OTHER: 'Other',
													};
													return typeLabels[selectedReality.type];
												})()}
											</Text>
										</div>
									</div>
								</div>
							</div>

							{/* @NOTE: Right Column - Technical Details & Actions */}
							<div style={{ flex: 1 }}>
								<div className={styles.modalSection}>
									<Title level={4} style={{ marginBottom: '16px', color: '#1890ff' }}>
										Technical Details
									</Title>

									<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												padding: '12px',
												backgroundColor: '#f8f9fa',
												borderRadius: '8px',
											}}
										>
											<Text strong style={{ color: '#666' }}>
												ID:
											</Text>
											<Text style={{ textAlign: 'right' }}>{selectedReality.id}</Text>
										</div>

										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												padding: '12px',
												backgroundColor: '#f8f9fa',
												borderRadius: '8px',
											}}
										>
											<Text strong style={{ color: '#666' }}>
												Reality ID:
											</Text>
											<Text style={{ textAlign: 'right' }}>{selectedReality.reality_id}</Text>
										</div>
									</div>
								</div>

								{/* @NOTE: Actions Section */}
								<div className={styles.modalSection}>
									<Title level={4} style={{ marginBottom: '16px', color: '#1890ff' }}>
										Actions
									</Title>

									<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
											style={{ width: '100%', height: '48px' }}
										>
											View Property on Sreality.cz
										</Button>

										<Button
											type={isLiked(selectedReality.id) ? 'primary' : 'default'}
											icon={isLiked(selectedReality.id) ? <HeartFilled /> : <HeartOutlined />}
											onClick={handleModalLikeToggle}
											loading={likeLoading}
											style={{
												width: '100%',
												height: '48px',
												backgroundColor: isLiked(selectedReality.id) ? '#ff4d4f' : undefined,
												borderColor: isLiked(selectedReality.id) ? '#ff4d4f' : undefined,
											}}
										>
											{isLiked(selectedReality.id) ? 'Unlike' : 'Like'}
										</Button>

										<div
											style={{
												fontSize: '12px',
												color: '#999',
												textAlign: 'center',
												marginTop: '8px',
											}}
										>
											Opens in a new tab
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</Modal>

			{/* @NOTE: Delete Confirmation Modal */}
			<Modal
				title="Delete Reality"
				open={isDeleteModalVisible}
				onCancel={handleDeleteModalClose}
				footer={[
					<Button key="no" onClick={handleDeleteModalClose}>
						No
					</Button>,
					<Button key="yes" type="primary" danger loading={deleteLoading} onClick={handleDeleteConfirm}>
						Yes
					</Button>,
				]}
				width={400}
			>
				<Text>Do you really want to delete reality "{realityToDelete?.title}"?</Text>
			</Modal>
		</div>
	);
};

// biome-ignore lint/style/noDefaultExport: Next.js requires default export for pages
export default RealitiesPage;
