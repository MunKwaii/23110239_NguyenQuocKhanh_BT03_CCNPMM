import { useContext, useState } from 'react';
import { UsergroupAddOutlined, HomeOutlined, SettingOutlined, AppstoreOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Menu, Badge } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth.context';
import { CartContext } from '../../context/cart.context';

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