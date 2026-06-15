import { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Table, Button, Tag, Select, Input, Form, Typography, Space, Tabs, List, message, Divider, Avatar } from 'antd';
import { ShoppingOutlined, WalletOutlined, ArrowUpOutlined, FileTextOutlined, GiftOutlined, UserAddOutlined, AlertOutlined, CommentOutlined, ReloadOutlined, TransactionOutlined } from '@ant-design/icons';
import { getStatsSummaryApi, getWalletHistoryApi, simulateNotificationApi, updateOrderStatusApi } from '../util/api';

const { Title, Text } = Typography;

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);

    // Simulation Form State
    const [simType, setSimType] = useState('post');
    const [simTitle, setSimTitle] = useState('');
    const [simMessage, setSimMessage] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const statsRes = await getStatsSummaryApi();
            if (statsRes && statsRes.success) {
                setStats(statsRes.data);
            }
            const walletRes = await getWalletHistoryApi();
            if (walletRes && walletRes.success) {
                setTransactions(walletRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            message.error('Lỗi khi tải dữ liệu thống kê.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await updateOrderStatusApi(orderId, newStatus);
            if (res && res.orderStatus) {
                message.success(`Cập nhật đơn hàng thành công sang "${newStatus}".`);
                loadData(); // Reload stats and wallet balance
            } else {
                message.error('Cập nhật trạng thái thất bại.');
            }
        } catch (error) {
            console.error('Update status error:', error);
            message.error('Lỗi khi cập nhật trạng thái đơn hàng.');
        }
    };

    const handleSimulate = async () => {
        if (!simTitle.trim() || !simMessage.trim()) {
            message.warning('Vui lòng điền tiêu đề và nội dung giả lập.');
            return;
        }
        setSimulating(true);
        try {
            const res = await simulateNotificationApi({
                type: simType,
                title: simTitle,
                message: simMessage
            });
            if (res && res.success) {
                message.success(`Giả lập thành công! Tin nhắn WebSocket đã được phát và email đã được gửi.`);
                setSimTitle('');
                setSimMessage('');
                loadData(); // Reload stats to capture updates
            }
        } catch (error) {
            console.error('Simulation error:', error);
            message.error('Giả lập hoạt động thất bại.');
        } finally {
            setSimulating(false);
        }
    };

    // Auto fill template for simulation
    const selectSimType = (val) => {
        setSimType(val);
        if (val === 'post') {
            setSimTitle('Bài viết mới: Khám phá xu hướng thời trang Hè 2026');
            setSimMessage('Cập nhật các mẫu thiết kế cao cấp đón đầu xu hướng thời trang mùa hè năm nay. Đọc ngay để nhận voucher giảm giá!');
        } else if (val === 'event') {
            setSimTitle('Sự kiện đặc biệt: Siêu Sale Giữa Năm - Giảm 50%');
            setSimMessage('Chương trình diễn ra từ ngày 15/06 đến 20/06. Miễn phí vận chuyển toàn quốc cho mọi đơn hàng từ 0đ.');
        } else if (val === 'comment') {
            setSimTitle('Bình luận mới trên sản phẩm Áo thun Polo');
            setSimMessage('Khách hàng Nguyễn Văn A vừa bình luận: "Áo mặc mát, chất vải cotton co giãn rất thích, form ôm dáng chuẩn."');
        }
    };

    if (loading && !stats) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <ReloadOutlined spin style={{ fontSize: '32px', color: '#3b82f6' }} />
            </div>
        );
    }

    // Colors Palette
    const primaryColor = '#3b82f6'; // blue
    const successColor = '#10b981'; // green
    const warningColor = '#f59e0b'; // orange
    const inTransitColor = '#8b5cf6'; // purple

    // Extract stats safely
    const walletBalance = stats?.walletBalance || 0;
    const totalRevenue = stats?.totalRevenue || 0;
    const pendingCashFlow = stats?.pendingCashFlow || 0;
    const completedCashFlow = stats?.completedCashFlow || 0;
    const topProducts = stats?.topProducts || [];
    const dailyNewUsers = stats?.dailyNewUsers || [];
    const dailyRevenue = stats?.dailyRevenue || [];
    const statusCounts = stats?.statusCounts || {};
    const ordersByStatus = stats?.ordersByStatus || {};

    // Flatten recent orders for manager
    const recentOrders = [];
    Object.keys(ordersByStatus).forEach(status => {
        ordersByStatus[status].forEach(order => {
            recentOrders.push(order);
        });
    });
    // Sort recent orders by createdAt desc
    recentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Custom SVG Area Chart Data Calculation
    const maxRev = Math.max(...dailyRevenue.map(d => d.revenue), 1000000);
    const revPoints = dailyRevenue.map((d, index) => {
        const x = 50 + index * 90;
        const y = 200 - (d.revenue / maxRev) * 150;
        return `${x},${y}`;
    }).join(' ');

    // Custom SVG Bar Chart Data Calculation
    const maxUsers = Math.max(...dailyNewUsers.map(d => d.count), 5);
    const barData = dailyNewUsers.map((d, index) => {
        const x = 40 + index * 90;
        const height = (d.count / maxUsers) * 130;
        const y = 180 - height;
        return { ...d, x, y, height };
    });

    // Donut chart calculations
    const statusKeys = Object.keys(statusCounts);
    const totalStatusOrders = statusKeys.reduce((sum, k) => sum + statusCounts[k], 0);
    let cumulativePercent = 0;
    const donutSlices = statusKeys.map((key, i) => {
        const count = statusCounts[key];
        const percent = totalStatusOrders > 0 ? (count / totalStatusOrders) * 100 : 0;
        const startPercent = cumulativePercent;
        cumulativePercent += percent;

        // Colors for statuses
        const statusColors = {
            PENDING: '#f59e0b',
            CONFIRMED: '#3b82f6',
            PROCESSING: '#8b5cf6',
            SHIPPED: '#06b6d4',
            DELIVERED: '#10b981',
            CANCELLED: '#ef4444',
            CANCEL_REQUESTED: '#f43f5e'
        };

        return {
            key,
            count,
            percent,
            color: statusColors[key] || '#94a3b8',
            dashArray: `${percent} ${100 - percent}`,
            dashOffset: -startPercent
        };
    }).filter(slice => slice.percent > 0);

    return (
        <div style={{ padding: '30px', maxWidth: '1400px', margin: 'auto', background: '#f8fafc', minHeight: '100vh' }}>
            
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>📈 Trung tâm Báo cáo & Thống kê</Title>
                    <Text type="secondary">Tổng quan hoạt động bán hàng, quản lý dòng tiền ví và giả lập sự kiện realtime</Text>
                </div>
                <Button type="primary" icon={<ReloadOutlined />} onClick={loadData} style={{ borderRadius: '8px' }}>
                    Tải lại dữ liệu
                </Button>
            </div>

            {/* Top Cards Indicator */}
            <Row gutter={[20, 20]} style={{ marginBottom: '30px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: 'none' }} hoverable>
                        <Statistic
                            title={<span style={{ color: '#64748b', fontWeight: 600 }}>Doanh Thu Thực Tế (Đã Giao)</span>}
                            value={totalRevenue}
                            precision={0}
                            valueStyle={{ color: successColor, fontWeight: 800, fontSize: '26px' }}
                            prefix={<ArrowUpOutlined />}
                            suffix="đ"
                        />
                        <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>
                            Số tiền từ các đơn hàng <Tag color="success">DELIVERED</Tag>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: 'none', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }} hoverable>
                        <Statistic
                            title={<span style={{ color: '#1e40af', fontWeight: 700 }}>Ví Tài Khoản Của Bạn</span>}
                            value={walletBalance}
                            precision={0}
                            valueStyle={{ color: '#2563eb', fontWeight: 800, fontSize: '26px' }}
                            prefix={<WalletOutlined />}
                            suffix="đ"
                        />
                        <div style={{ marginTop: '8px', color: '#2563eb', fontSize: '12px', fontWeight: 500 }}>
                            Số dư khả dụng nạp từ đơn hàng thành công
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: 'none' }} hoverable>
                        <Statistic
                            title={<span style={{ color: '#64748b', fontWeight: 600 }}>Dòng Tiền Đang Giao</span>}
                            value={pendingCashFlow}
                            precision={0}
                            valueStyle={{ color: inTransitColor, fontWeight: 800, fontSize: '26px' }}
                            prefix={<ShoppingOutlined />}
                            suffix="đ"
                        />
                        <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>
                            Đơn hàng PENDING ➜ SHIPPED (Tiền treo chờ đối soát)
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: 'none' }} hoverable>
                        <Statistic
                            title={<span style={{ color: '#64748b', fontWeight: 600 }}>Dòng Tiền Hoàn Tất (Ví)</span>}
                            value={completedCashFlow}
                            precision={0}
                            valueStyle={{ color: successColor, fontWeight: 800, fontSize: '26px' }}
                            prefix={<TransactionOutlined />}
                            suffix="đ"
                        />
                        <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>
                            Tiền thực đã giải ngân và đưa vào ví người dùng
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Graphics and charts section */}
            <Row gutter={[20, 20]} style={{ marginBottom: '30px' }}>
                {/* Revenue Line Chart */}
                <Col xs={24} lg={12}>
                    <Card title="📈 Biểu đồ doanh thu 7 ngày qua" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                            <svg width="600" height="250" style={{ background: '#fff', borderRadius: '8px' }}>
                                {/* Grids */}
                                <line x1="50" y1="50" x2="590" y2="50" stroke="#f1f5f9" strokeDasharray="5,5" />
                                <line x1="50" y1="125" x2="590" y2="125" stroke="#f1f5f9" strokeDasharray="5,5" />
                                <line x1="50" y1="200" x2="590" y2="200" stroke="#e2e8f0" strokeWidth="2" />

                                {/* Area Fill */}
                                <polygon
                                    points={`50,200 ${revPoints} 590,200`}
                                    fill="url(#areaGrad)"
                                    opacity="0.15"
                                />

                                {/* Line path */}
                                <polyline
                                    fill="none"
                                    stroke={primaryColor}
                                    strokeWidth="3"
                                    points={revPoints}
                                />

                                {/* Points and text */}
                                {dailyRevenue.map((d, index) => {
                                    const x = 50 + index * 90;
                                    const y = 200 - (d.revenue / maxRev) * 150;
                                    return (
                                        <g key={index}>
                                            <circle cx={x} cy={y} r="5" fill={primaryColor} stroke="#fff" strokeWidth="2" />
                                            <text x={x} y={y - 12} fill="#475569" fontSize="10" fontWeight="600" textAnchor="middle">
                                                {d.revenue > 0 ? `${Math.round(d.revenue / 1000)}k` : '0'}
                                            </text>
                                            <text x={x} y="220" fill="#64748b" fontSize="11" textAnchor="middle">
                                                {d.date}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Gradients Definition */}
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={primaryColor} />
                                        <stop offset="100%" stopColor="#fff" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </Card>
                </Col>

                {/* New Customers Column Chart */}
                <Col xs={24} lg={12}>
                    <Card title="👥 Số lượng khách hàng mới đăng ký (7 ngày qua)" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                            <svg width="600" height="250" style={{ background: '#fff', borderRadius: '8px' }}>
                                <line x1="40" y1="50" x2="580" y2="50" stroke="#f1f5f9" strokeDasharray="5,5" />
                                <line x1="40" y1="115" x2="580" y2="115" stroke="#f1f5f9" strokeDasharray="5,5" />
                                <line x1="40" y1="180" x2="580" y2="180" stroke="#e2e8f0" strokeWidth="2" />

                                {/* Columns */}
                                {barData.map((d, index) => (
                                    <g key={index}>
                                        <rect
                                            x={d.x - 18}
                                            y={d.y}
                                            width="36"
                                            height={d.height}
                                            fill={inTransitColor}
                                            rx="4"
                                            opacity="0.85"
                                        />
                                        <text x={d.x} y={d.y - 8} fill="#1e293b" fontSize="11" fontWeight="bold" textAnchor="middle">
                                            {d.count}
                                        </text>
                                        <text x={d.x} y="200" fill="#64748b" fontSize="11" textAnchor="middle">
                                            {d.date}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Order status breakdowns & Wallet Transactions */}
            <Row gutter={[20, 20]} style={{ marginBottom: '30px' }}>
                
                {/* Donut chart Order Status */}
                <Col xs={24} md={10}>
                    <Card title="📊 Tỷ lệ trạng thái đơn hàng" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                        {totalStatusOrders === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>Chưa có đơn hàng nào để vẽ biểu đồ</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="180" height="180" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)', marginBottom: '20px' }}>
                                    <circle cx="21" cy="21" r="15.915" fill="#fff" />
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                                    
                                    {donutSlices.map((slice, idx) => (
                                        <circle
                                            key={idx}
                                            cx="21"
                                            cy="21"
                                            r="15.915"
                                            fill="transparent"
                                            stroke={slice.color}
                                            strokeWidth="3.2"
                                            strokeDasharray={slice.dashArray}
                                            strokeDashoffset={slice.dashOffset}
                                        />
                                    ))}
                                </svg>
                                
                                <div style={{ width: '100%' }}>
                                    <Row gutter={[8, 8]}>
                                        {donutSlices.map((slice, i) => (
                                            <Col span={12} key={i}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: slice.color, display: 'inline-block' }}></span>
                                                    <span style={{ color: '#475569', fontWeight: 600 }}>{slice.key}</span>
                                                    <span style={{ color: '#94a3b8' }}>({slice.count} - {Math.round(slice.percent)}%)</span>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Top 10 Best Selling Products */}
                <Col xs={24} md={14}>
                    <Card title="🏆 Top 10 Sản Phẩm Bán Nhiều Nhất" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
                        <Table
                            dataSource={topProducts}
                            rowKey="_id"
                            pagination={false}
                            size="small"
                            columns={[
                                {
                                    title: 'Sản phẩm',
                                    dataIndex: 'name',
                                    key: 'name',
                                    render: (text, record) => (
                                        <Space>
                                            <Avatar src={record.image} shape="square" size="small" />
                                            <Text strong style={{ fontSize: '13px' }}>{text}</Text>
                                        </Space>
                                    )
                                },
                                {
                                    title: 'Đã bán',
                                    dataIndex: 'sold',
                                    key: 'sold',
                                    align: 'center',
                                    render: (sold) => <Tag color="cyan" style={{ fontWeight: 'bold' }}>{sold}</Tag>
                                },
                                {
                                    title: 'Giá bán',
                                    dataIndex: 'salePrice',
                                    key: 'salePrice',
                                    align: 'right',
                                    render: (val, record) => (
                                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                                            {(val || record.price).toLocaleString('vi-VN')}đ
                                        </span>
                                    )
                                },
                                {
                                    title: 'Tồn kho',
                                    dataIndex: 'stock',
                                    key: 'stock',
                                    align: 'center',
                                    render: (stock) => <span style={{ color: stock < 10 ? '#f59e0b' : '#64748b' }}>{stock}</span>
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[20, 20]} style={{ marginBottom: '30px' }}>
                {/* Wallet transaction ledger */}
                <Col xs={24} lg={12}>
                    <Card title="💳 Lịch sử biến động số dư ví" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <Table
                            dataSource={transactions}
                            rowKey="_id"
                            pagination={{ pageSize: 5 }}
                            size="small"
                            columns={[
                                {
                                    title: 'Thời gian',
                                    dataIndex: 'createdAt',
                                    key: 'createdAt',
                                    render: (date) => new Date(date).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
                                },
                                {
                                    title: 'Biến động',
                                    dataIndex: 'amount',
                                    key: 'amount',
                                    render: (amount, record) => {
                                        const isCredit = record.type === 'credit';
                                        return (
                                            <span style={{ color: isCredit ? successColor : '#ef4444', fontWeight: 'bold' }}>
                                                {isCredit ? '+' : '-'}{amount.toLocaleString('vi-VN')}đ
                                            </span>
                                        );
                                    }
                                },
                                {
                                    title: 'Nội dung',
                                    dataIndex: 'description',
                                    key: 'description',
                                }
                            ]}
                        />
                    </Card>
                </Col>

                {/* Real-time Simulator Panel */}
                <Col xs={24} lg={12}>
                    <Card title="⚙️ Trình giả lập hoạt động hệ thống (Real-time & Mail)" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', background: '#ffffff' }}>
                        <div style={{ marginBottom: '15px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <Text strong style={{ display: 'block', marginBottom: '4px', color: '#1e293b' }}><AlertOutlined style={{ color: warningColor }} /> Hướng dẫn giả lập:</Text>
                            <Text size="small" type="secondary">
                                Khi kích hoạt giả lập, hệ thống sẽ lưu thông báo mới vào Database, đồng thời **bắn WebSocket tin nhắn realtime** tới client hiển thị Banner Popup nổi, và gửi một **Email thông báo thực tế** đến tài khoản Gmail của bạn.
                            </Text>
                        </div>

                        <Form layout="vertical">
                            <Form.Item label="Loại hoạt động giả lập">
                                <Select value={simType} onChange={selectSimType} style={{ borderRadius: '6px' }}>
                                    <Select.Option value="post">📝 Bài viết mới (New Post)</Select.Option>
                                    <Select.Option value="event">🎉 Sự kiện mới (New Event)</Select.Option>
                                    <Select.Option value="comment">💬 Bình luận mới (New Comment)</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item label="Tiêu đề thông báo">
                                <Input
                                    value={simTitle}
                                    onChange={(e) => setSimTitle(e.target.value)}
                                    placeholder="Điền tiêu đề thông báo"
                                    style={{ borderRadius: '6px' }}
                                />
                            </Form.Item>

                            <Form.Item label="Nội dung chi tiết">
                                <Input.TextArea
                                    value={simMessage}
                                    onChange={(e) => setSimMessage(e.target.value)}
                                    placeholder="Điền nội dung chi tiết hoạt động..."
                                    rows={3}
                                    style={{ borderRadius: '6px' }}
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                onClick={handleSimulate}
                                loading={simulating}
                                block
                                icon={<ReloadOutlined />}
                                style={{ height: '40px', borderRadius: '8px', background: inTransitColor, border: 'none' }}
                            >
                                Phát thông báo Real-time & Gửi Mail
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>

            {/* Admin Order Status Manager */}
            <Card title="🛠️ Trình quản lý trạng thái đơn hàng (Cộng tiền vào ví)" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '15px' }}>
                    <Text type="secondary">
                        Thay đổi trạng thái đơn hàng bên dưới để kiểm tra dòng tiền. Khi chuyển trạng thái sang <Tag color="success">DELIVERED</Tag>, tổng tiền đơn hàng sẽ **tự động được cộng vào ví tài khoản của khách hàng**, đồng thời phát thông báo và gửi email biên lai ví.
                    </Text>
                </div>
                <Table
                    dataSource={recentOrders}
                    rowKey="_id"
                    pagination={{ pageSize: 5 }}
                    size="middle"
                    columns={[
                        {
                            title: 'Mã đơn',
                            dataIndex: '_id',
                            key: '_id',
                            render: (id) => <Text strong>#{id.toString().substring(18)}</Text>
                        },
                        {
                            title: 'Khách hàng',
                            dataIndex: 'shippingAddress',
                            key: 'customer',
                            render: (addr, record) => (
                                <div>
                                    <Text style={{ display: 'block' }}>{addr.fullName}</Text>
                                    <Text type="secondary" style={{ fontSize: '11px' }}>{record.email}</Text>
                                </div>
                            )
                        },
                        {
                            title: 'Tổng số tiền',
                            dataIndex: 'totalAmount',
                            key: 'totalAmount',
                            render: (val) => <span style={{ fontWeight: 'bold' }}>{val.toLocaleString('vi-VN')}đ</span>
                        },
                        {
                            title: 'Hình thức',
                            dataIndex: 'paymentMethod',
                            key: 'paymentMethod',
                            render: (val) => <Tag color="blue">{val}</Tag>
                        },
                        {
                            title: 'Trạng thái hiện tại',
                            dataIndex: 'orderStatus',
                            key: 'orderStatus',
                            render: (status) => {
                                let color = 'gold';
                                if (status === 'DELIVERED') color = 'green';
                                else if (status === 'CANCELLED') color = 'red';
                                else if (status === 'SHIPPED') color = 'cyan';
                                else if (status === 'PROCESSING') color = 'purple';
                                return <Tag color={color} style={{ fontWeight: 'bold' }}>{status}</Tag>;
                            }
                        },
                        {
                            title: 'Giả lập thay đổi trạng thái',
                            key: 'action',
                            render: (_, record) => (
                                <Select
                                    value={record.orderStatus}
                                    onChange={(val) => handleUpdateStatus(record._id, val)}
                                    style={{ width: '180px' }}
                                >
                                    <Select.Option value="PENDING">🕒 PENDING</Select.Option>
                                    <Select.Option value="CONFIRMED">✓ CONFIRMED</Select.Option>
                                    <Select.Option value="PROCESSING">⚙️ PROCESSING</Select.Option>
                                    <Select.Option value="SHIPPED">🚚 SHIPPED</Select.Option>
                                    <Select.Option value="DELIVERED">📦 DELIVERED (Cộng tiền ví)</Select.Option>
                                    <Select.Option value="CANCELLED">❌ CANCELLED</Select.Option>
                                </Select>
                            )
                        }
                    ]}
                />
            </Card>
        </div>
    );
}
