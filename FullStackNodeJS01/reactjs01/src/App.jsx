import React, { useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/layout/layout/header';
import { AuthContext } from './components/context/auth.context';
import { getAccountApi } from './util/api';
import { Spin } from 'antd';

function App() {
  const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);

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
              name: res.name
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
  }, []);

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
