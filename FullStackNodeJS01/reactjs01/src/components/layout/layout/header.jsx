import { useContext, useState, useEffect } from 'react';
import { UsergroupAddOutlined, HomeOutlined, SettingOutlined, AppstoreOutlined, ShoppingCartOutlined, BarChartOutlined, BellOutlined, FileTextOutlined, CommentOutlined, GiftOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Menu, Badge, Popover, List, Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth.context';
import { CartContext } from '../../context/cart.context';
import { getNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from '../../../util/api';
import { socket } from '../../../util/socket';

// Popover component for managing real-time notifications dropdown list
const NotificationsPopover = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [visible, setVisible] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await getNotificationsApi();
            if (res && res.success) {
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Listen for new notifications
        const handleNewNotification = (newNotif) => {
            setNotifications(prev => [newNotif, ...prev].slice(0, 30));
            setUnreadCount(prev => prev + 1);
        };

        socket.on('notification', handleNewNotification);

        return () => {
            socket.off('notification', handleNewNotification);
        };
    }, []);

    const handleMarkAsRead = async (notif) => {
        if (notif.isRead) return;
        try {
            const res = await markNotificationReadApi(notif._id);
            if (res && res.success) {
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Mark read error:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await markAllNotificationsReadApi();
            if (res && res.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
                message.success("Đã đánh dấu đọc tất cả thông báo.");
            }
        } catch (error) {
            console.error("Mark all read error:", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order':
                return <ShoppingOutlined style={{ color: '#10b981', fontSize: '18px' }} />;
            case 'review':
                return <CommentOutlined style={{ color: '#f59e0b', fontSize: '18px' }} />;
            case 'post':
                return <FileTextOutlined style={{ color: '#8b5cf6', fontSize: '18px' }} />;
            case 'event':
                return <GiftOutlined style={{ color: '#ec4899', fontSize: '18px' }} />;
            default:
                return <BellOutlined style={{ color: '#3b82f6', fontSize: '18px' }} />;
        }
    };

    const notificationContent = (
        <div style={{ width: '360px', maxHeight: '420px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <Typography.Text style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>Thông Báo Mới</Typography.Text>
                {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={handleMarkAllRead} style={{ padding: 0, height: 'auto' }}>
                        Đọc tất cả
                    </Button>
                )}
            </div>
            <List
                dataSource={notifications}
                locale={{ emptyText: <div style={{ padding: '20px 0', color: '#94a3b8' }}>Không có thông báo mới</div> }}
                renderItem={(item) => (
                    <List.Item
                        onClick={() => handleMarkAsRead(item)}
                        style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            backgroundColor: item.isRead ? '#ffffff' : '#f8fafc',
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'all 0.2s',
                        }}
                    >
                        <List.Item.Meta
                            avatar={<div style={{ padding: '8px', borderRadius: '50%', background: '#f1f5f9', display: 'flex' }}>{getIcon(item.type)}</div>}
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontWeight: item.isRead ? 'normal' : 'bold', color: '#1e293b', fontSize: '13px' }}>{item.title}</span>
                                    <span style={{ fontSize: '10px', color: '#94a3b8', flexShrink: 0 }}>
                                        {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            }
                            description={
                                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px', lineBreak: 'anywhere' }}>
                                    {item.message}
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
            <div style={{ padding: '10px', borderTop: '1px solid #f1f5f9', textAlign: 'center', background: '#f8fafc' }}>
                <Link to="/dashboard" onClick={() => setVisible(false)} style={{ fontSize: '13px', fontWeight: '600', color: '#3b82f6' }}>
                    Xem tất cả trong Dashboard
                </Link>
            </div>
        </div>
    );

    return (
        <Popover
            content={notificationContent}
            title={null}
            trigger="click"
            open={visible}
            onOpenChange={setVisible}
            placement="bottomRight"
            overlayStyle={{ padding: 0 }}
        >
            <Badge count={unreadCount} size="small" offset={[5, -2]}>
                <span style={{ color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BellOutlined style={{ fontSize: '18px' }} />
                    <span>Thông báo</span>
                </span>
            </Badge>
        </Popover>
    );
};

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);

    const items = [
        {
            label: <Link to={"/"}>Home Page</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        ...(auth.isAuthenticated ? [
            {
                label: <Link to={"/categories"}>Danh mục</Link>,
                key: 'categories',
                icon: <AppstoreOutlined />,
            },
            {
                label: (
                    <Link to={"/cart"}>
                        <Badge count={cartCount} size="small" offset={[8, -2]}>
                            <span style={{ color: '#fff' }}>Giỏ hàng</span>
                        </Badge>
                    </Link>
                ),
                key: 'cart',
                icon: <ShoppingCartOutlined />,
            },
            {
                label: <Link to={"/dashboard"}>Báo cáo & Thống kê</Link>,
                key: 'dashboard',
                icon: <BarChartOutlined />,
            },
            {
                label: (
                    <NotificationsPopover />
                ),
                key: 'notifications',
            },
            {
                label: <Link to={"/user"}>Users</Link>,
                key: 'user',
                icon: <UsergroupAddOutlined />,
            }
        ] : []),

        {
            label: `Welcome ${auth?.user?.email ?? ""}`,
            key: 'SubMenu',
            icon: <SettingOutlined />,
            children: [
                ...(auth.isAuthenticated ? [
                    {
                        label: <Link to={"/profile"}>Trang cá nhân</Link>,
                        key: 'profile',
                    },
                    {
                        label: <Link to={"/orders"}>Đơn hàng của tôi</Link>,
                        key: 'orders',
                    },
                    {
                        label: <span onClick={() => {
                            localStorage.removeItem("access_token");
                            setAuth({
                                isAuthenticated: false,
                                user: {
                                    email: "",
                                    name: "",
                                    role: ""
                                }
                            })
                            navigate("/");
                        }}>Đăng xuất</span>,
                        key: 'logout',
                    }
                ] : [
                    {
                        label: <Link to={"/login"}>Đăng nhập</Link>,
                        key: 'login',
                    }
                ]),
            ],
        },
    ];

    const [current, setCurrent] = useState('mail');
    const onClick = (e) => {
        console.log('click ', e);
        setCurrent(e.key);
    };

    return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default Header;