import { useContext, useState, useEffect } from 'react';
import { UsergroupAddOutlined, HomeOutlined, AppstoreOutlined, ShoppingCartOutlined, BarChartOutlined, BellOutlined, FileTextOutlined, CommentOutlined, GiftOutlined, ShoppingOutlined, SearchOutlined } from '@ant-design/icons';
import { Badge, Popover, List, Button, message } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
                return <ShoppingOutlined style={{ color: '#10b981', fontSize: '16px' }} />;
            case 'review':
                return <CommentOutlined style={{ color: '#f59e0b', fontSize: '16px' }} />;
            case 'post':
                return <FileTextOutlined style={{ color: '#8b5cf6', fontSize: '16px' }} />;
            case 'event':
                return <GiftOutlined style={{ color: '#ec4899', fontSize: '16px' }} />;
            default:
                return <BellOutlined style={{ color: '#3b82f6', fontSize: '16px' }} />;
        }
    };

    const notificationContent = (
        <div style={{ width: '360px', maxHeight: '420px', overflowY: 'auto', background: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #334155' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#f1f5f9' }}>Thông Báo Mới</span>
                {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={handleMarkAllRead} style={{ padding: 0, height: 'auto', color: '#a78bfa' }}>
                        Đọc tất cả
                    </Button>
                )}
            </div>
            <List
                dataSource={notifications}
                locale={{ emptyText: <div style={{ padding: '24px 0', color: '#64748b', textAlign: 'center', fontSize: '13px' }}>Không có thông báo mới</div> }}
                renderItem={(item) => (
                    <List.Item
                        onClick={() => handleMarkAsRead(item)}
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            backgroundColor: item.isRead ? '#1e293b' : '#24324d',
                            borderBottom: '1px solid #334155',
                            transition: 'all 0.2s',
                        }}
                        className="hover:bg-slate-700/50"
                    >
                        <List.Item.Meta
                            avatar={<div style={{ padding: '8px', borderRadius: '50%', background: '#0f172a', display: 'flex' }}>{getIcon(item.type)}</div>}
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontWeight: item.isRead ? 'normal' : 'bold', color: '#f1f5f9', fontSize: '13px' }}>{item.title}</span>
                                    <span style={{ fontSize: '10px', color: '#64748b', flexShrink: 0 }}>
                                        {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            }
                            description={
                                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px', lineBreak: 'anywhere' }}>
                                    {item.message}
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
            <div style={{ padding: '12px', borderTop: '1px solid #334155', textAlign: 'center', background: '#0f172a' }}>
                <Link to="/dashboard" onClick={() => setVisible(false)} style={{ fontSize: '13px', fontWeight: '600', color: '#a78bfa', textDecoration: 'none' }}>
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
            overlayInnerStyle={{ padding: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
        >
            <Badge count={unreadCount} size="small" offset={[5, -2]}>
                <span style={{ color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                    <BellOutlined style={{ fontSize: '18px' }} />
                    <span>Thông báo</span>
                </span>
            </Badge>
        </Popover>
    );
};

// Popover component for managing User options dropdown
const UserPopover = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        setAuth({
            isAuthenticated: false,
            user: {
                email: "",
                name: "",
                role: ""
            }
        });
        setVisible(false);
        navigate("/");
    };

    const content = (
        <div style={{ width: '220px', background: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #334155', background: '#1e293b' }}>
                <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {auth.user.name || 'Member'}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {auth.user.email}
                </div>
                <div style={{ display: 'inline-block', background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.4)', color: '#a78bfa', borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', marginTop: 6 }}>
                    {auth.user.role || 'USER'}
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', background: '#1e293b' }}>
                <Link to="/profile" onClick={() => setVisible(false)} style={{ padding: '10px 16px', color: '#94a3b8', textDecoration: 'none', transition: 'all 0.2s', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#24324d'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                >
                    👤 Trang cá nhân
                </Link>
                <Link to="/orders" onClick={() => setVisible(false)} style={{ padding: '10px 16px', color: '#94a3b8', textDecoration: 'none', transition: 'all 0.2s', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#24324d'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                >
                    📦 Đơn hàng của tôi
                </Link>
                <div style={{ borderTop: '1px solid #334155', margin: '4px 0' }} />
                <div onClick={handleLogout} style={{ padding: '10px 16px', color: '#f87171', cursor: 'pointer', transition: 'all 0.2s', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ff8787'; e.currentTarget.style.background = '#3f1f1f'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'transparent'; }}
                >
                    🚪 Đăng xuất
                </div>
            </div>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            open={visible}
            onOpenChange={setVisible}
            placement="bottomRight"
            overlayInnerStyle={{ padding: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '6px 14px', cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
            >
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    {(auth.user.name || auth.user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700 }}>
                    {auth.user.name || 'Member'}
                </span>
            </div>
        </Popover>
    );
};

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);

    const isActive = (path) => location.pathname === path;

    const navLinkStyle = (path) => ({
        color: isActive(path) ? '#fff' : '#94a3b8',
        fontWeight: 700,
        fontSize: '14px',
        textDecoration: 'none',
        transition: 'color 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    });

    return (
        <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid #1e293b',
            padding: '0 24px',
            fontFamily: "'Inter', system-ui, sans-serif"
        }}>
            <div style={{
                maxWidth: 1280,
                margin: '0 auto',
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Left: Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18 }}>🎧</div>
                    <span style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(90deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TechZone</span>
                </div>

                {/* Middle: Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                    <Link to="/" style={navLinkStyle('/')}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => { if (!isActive('/')) e.currentTarget.style.color = '#94a3b8'; }}
                    >
                        <HomeOutlined />
                        <span>Trang chủ</span>
                    </Link>
                    {auth.isAuthenticated && (
                        <>
                            <Link to="/categories" style={navLinkStyle('/categories')}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={e => { if (!isActive('/categories')) e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <AppstoreOutlined />
                                <span>Danh mục</span>
                            </Link>
                            <Link to="/search" style={navLinkStyle('/search')}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={e => { if (!isActive('/search')) e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <SearchOutlined />
                                <span>Tìm kiếm</span>
                            </Link>
                            <Link to="/dashboard" style={navLinkStyle('/dashboard')}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={e => { if (!isActive('/dashboard')) e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <BarChartOutlined />
                                <span>Báo cáo & Thống kê</span>
                            </Link>
                            <Link to="/user" style={navLinkStyle('/user')}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={e => { if (!isActive('/user')) e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <UsergroupAddOutlined />
                                <span>Users</span>
                            </Link>
                        </>
                    )}
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {auth.isAuthenticated ? (
                        <>
                            <NotificationsPopover />
                            
                            <Link to="/cart" style={{ textDecoration: 'none' }}>
                                <Badge count={cartCount} size="small" offset={[5, -2]}>
                                    <span style={{ color: isActive('/cart') ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                        onMouseLeave={e => { if (!isActive('/cart')) e.currentTarget.style.color = '#94a3b8'; }}
                                    >
                                        <ShoppingCartOutlined style={{ fontSize: '18px' }} />
                                        <span>Giỏ hàng</span>
                                    </span>
                                </Badge>
                            </Link>

                            <UserPopover />
                        </>
                    ) : (
                        <Link to="/login" style={{
                            background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
                            color: '#fff',
                            padding: '8px 22px',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 14,
                            textDecoration: 'none',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            Đăng nhập
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;