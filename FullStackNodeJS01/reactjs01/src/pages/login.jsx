import { useContext, useState } from 'react';
import { notification } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const onFinish = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const email = fd.get('email');
        const password = fd.get('password');

        setLoading(true);
        const res = await loginApi(email, password);
        setLoading(false);

        if (res && res.EC === 0) {
            localStorage.setItem('access_token', res.access_token);
            notification.success({ message: 'Đăng nhập thành công!', description: `Chào mừng ${res?.user?.name || res?.user?.email}` });
            setAuth({ isAuthenticated: true, user: { email: res?.user?.email ?? '', name: res?.user?.name ?? '', role: res?.user?.role ?? '' } });
            navigate('/');
        } else {
            notification.error({ message: 'Đăng nhập thất bại', description: res?.EM ?? 'Email hoặc mật khẩu không đúng' });
        }
    };

    const S = {
        page: { minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' },
        blob1: { position: 'absolute', top: '-15%', left: '-10%', width: '45%', paddingTop: '45%', background: 'radial-gradient(circle,rgba(124,58,237,.25),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' },
        blob2: { position: 'absolute', bottom: '-15%', right: '-10%', width: '45%', paddingTop: '45%', background: 'radial-gradient(circle,rgba(236,72,153,.2),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' },
        card: { position: 'relative', zIndex: 10, background: 'rgba(30,41,59,.8)', backdropFilter: 'blur(20px)', border: '1px solid #334155', borderRadius: 24, padding: '48px 44px', width: '100%', maxWidth: 440 },
        iconWrap: { width: 64, height: 64, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 30 },
        title: { fontSize: 30, fontWeight: 900, color: '#f8fafc', textAlign: 'center', margin: '0 0 8px' },
        sub: { color: '#64748b', textAlign: 'center', margin: '0 0 36px', fontSize: 14 },
        label: { display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8 },
        inputWrap: { position: 'relative', marginBottom: 20 },
        input: { width: '100%', padding: '14px 16px', background: 'rgba(15,23,42,.6)', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s,box-shadow .2s', fontFamily: 'inherit' },
        btn: { width: '100%', padding: '15px', background: loading ? '#4c1d95' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8, transition: 'opacity .2s,transform .2s', opacity: loading ? 0.7 : 1 },
        divider: { borderTop: '1px solid #1e293b', margin: '28px 0' },
        linkRow: { textAlign: 'center', fontSize: 14, color: '#64748b' },
    };

    const handleFocus = e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,.2)'; };
    const handleBlur = e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none'; };

    return (
        <div style={S.page}>
            <div style={S.blob1} />
            <div style={S.blob2} />

            <div style={S.card}>
                <div style={S.iconWrap}>🎧</div>
                <h1 style={S.title}>Chào mừng trở lại</h1>
                <p style={S.sub}>Đăng nhập vào tài khoản <span style={{ color: '#a78bfa', fontWeight: 700 }}>TechZone</span> của bạn</p>

                <form onSubmit={onFinish}>
                    <div style={S.inputWrap}>
                        <label style={S.label}>Email</label>
                        <input name="email" type="email" required placeholder="name@company.com" style={S.input} onFocus={handleFocus} onBlur={handleBlur} />
                    </div>

                    <div style={S.inputWrap}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <label style={{ ...S.label, marginBottom: 0 }}>Mật khẩu</label>
                            <Link to="/forgot-password" style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>Quên mật khẩu?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input name="password" type={showPass ? 'text' : 'password'} required placeholder="••••••••" style={{ ...S.input, paddingRight: 50 }} onFocus={handleFocus} onBlur={handleBlur} />
                            <button type="button" onClick={() => setShowPass(v => !v)}
                                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 18, padding: 0 }}>
                                {showPass ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={S.btn}
                        onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(124,58,237,.5)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập ngay →'}
                    </button>
                </form>

                <div style={S.divider} />

                <div style={S.linkRow}>
                    Chưa có tài khoản?{' '}
                    <Link to="/register" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>Đăng ký miễn phí</Link>
                </div>
                <div style={{ ...S.linkRow, marginTop: 14 }}>
                    <Link to="/" style={{ color: '#475569', fontSize: 13, textDecoration: 'none' }}>← Quay lại trang chủ</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;