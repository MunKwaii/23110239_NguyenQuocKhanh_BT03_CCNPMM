import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import RegisterPage from './pages/register.jsx';
import LoginPage from './pages/login.jsx';
import UserPage from './pages/user.jsx';
import HomePage from './pages/home.jsx';
import ForgotPasswordPage from './pages/forgot-password.jsx';
import ProductDetailPage from './pages/product-detail.jsx';
import SearchPage from './pages/search.jsx';
import CategoriesPage from './pages/categories.jsx';
import CartPage from './pages/cart.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';
import { CartWrapper } from './components/context/cart.context.jsx';
import './styles/global.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "user",
        element: <UserPage />,
      },
      {
        path: "product/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
    ],
  },
  {
    path: "register",
    element: <RegisterPage />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "forgot-password",
    element: <ForgotPasswordPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthWrapper>
      <CartWrapper>
        <RouterProvider router={router} />
      </CartWrapper>
    </AuthWrapper>
  </React.StrictMode>,
)
