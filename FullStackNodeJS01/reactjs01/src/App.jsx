import { useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/layout/layout/header';
import { AuthContext } from './components/context/auth.context';
import { getAccountApi } from './util/api';
import { Spin, notification } from 'antd';
import { socket } from './util/socket';

function App() {
  const { auth, setAuth, appLoading, setAppLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      try {
        const res = await getAccountApi();
        if (res && !res.message) {
          setAuth({
            isAuthenticated: true,
            user: {
              email: res.email,
              name: res.name,
              role: res.role
            }
          })
        }
      } catch (error) {
        console.log(">>> Error fetching account: ", error);
      } finally {
        setAppLoading(false);
      }
    }
    fetchAccount();
  }, [setAppLoading, setAuth]);

  // Hook up WebSocket listeners on authentication state changes
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.email) {
      socket.connect();
      socket.emit('register', auth.user.email);

      const handleNotification = (notif) => {
        let borderCol = '#3b82f6';
        let bgCol = '#eff6ff';
        if (notif.type === 'review') {
          borderCol = '#f59e0b';
          bgCol = '#fffbeb';
        } else if (notif.type === 'order') {
          borderCol = '#10b981';
          bgCol = '#ecfdf5';
        } else if (notif.type === 'post') {
          borderCol = '#8b5cf6';
          bgCol = '#f5f3ff';
        } else if (notif.type === 'event') {
          borderCol = '#ec4899';
          bgCol = '#fdf2f8';
        }

        notification.open({
          message: <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{notif.title}</span>,
          description: notif.message,
          placement: 'topRight',
          duration: 6,
          style: {
            borderRadius: '12px',
            borderLeft: `5px solid ${borderCol}`,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            background: bgCol
          }
        });
      };

      socket.on('notification', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
        socket.disconnect();
      };
    }
  }, [auth]);

  return (
    <>
      {appLoading === true ?
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <Spin size="large" />
        </div>
        :
        <>
          <Header />
          <Outlet />
        </>
      }
    </>
  )
}

export default App
