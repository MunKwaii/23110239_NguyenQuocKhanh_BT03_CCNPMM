import { createContext, useState } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({
    isAuthenticated: false,
    user: {
        email: "",
        name: "",
        role: ""
    },
});

export const AuthWrapper = (props) => {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        user: {
            email: "",
            name: "",
            role: ""
        },
    });

    const [appLoading, setAppLoading] = useState(true);

    return (
        <AuthContext.Provider value={{
            auth,
            setAuth,
            appLoading,
            setAppLoading
        }}>
            {props.children}
        </AuthContext.Provider>
    );
};