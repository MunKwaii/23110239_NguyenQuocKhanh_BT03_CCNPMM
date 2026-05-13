import { useState } from 'react';
import { notification } from 'antd';
import { createUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const onFinish = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = fd.get('name');
        const email = fd.get('email');
        const password = fd.get('password');

        setLoading(true);
        const res = await createUserApi(name, email, password);
        setLoading(false);

        if (res && res.EC === 0) {
            notification.success({ message: 'Đăng ký thành công!', description: 'Tài khoản đã được tạo. Vui lòng đăng nhập.' });
            navigate('/login');
        } else {
            notification.error({ message: 'Đăng ký thất bại', description: res?.EM ?? 'Có lỗi xảy ra, vui lòng thử lại.' });
        }
    };

    const S = {
        page: { minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' },
        blob1: { position: 'absolute', top: '-15%', right: '-10%', width: '45%', paddingTop: '45%', background: 'radial-gradient(circle,rgba(236,72,153,.2),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' },
        blob2: { position: 'absolute', bottom: '-15%', left: '-10%', width: '45%', paddingTop: '45%', background: 'radial-gradient(circle,rgba(124,58,237,.2),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' },
        card: { position: 'relative', zIndex: 10, background: 'rgba(30,41,59,.8)', backdropFilter: 'blur(20px)', border: '1px solid #334155', borderRadius: 24, padding: '48px 44px', width: '100%', maxWidth: 440 },
        iconWrap: { width: 64, height: 64, background: 'linear-gradient(135deg,#ec4899,#7c3aed)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 30 },
        title: { fontSize: 30, fontWeight: 900, color: '#f8fafc', textAlign: 'center', margin: '0 0 8px' },
        sub: { color: '#64748b', textAlign: 'center', margin: '0 0 36px', fontSize: 14 },
        label: { display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8 },
        inputWrap: { marginBottom: 20 },
        input: { width: '100%', padding: '14px 16px', background: 'rgba(15,23,42,.6)', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s,box-shadow .2s', fontFamily: 'inherit' },
        btn: { width: '100%', padding: '15px', background: loading ? '#831843' : 'linear-gradient(135deg,#ec4899,#7c3aed)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8, opacity: loading ? 0.7 : 1, transition: 'transform .2s' },
        divider: { borderTop: '1px solid #1e293b', margin: '28px 0' },
        linkRow: { textAlign: 'center', fontSize: 14, color: '#64748b' },
    };

    const handleFocus = e => { e.target.style.borderColor = '#ec4899'; e.target.style.boxShadow = '0 0 0 3px rgba(236,72,153,.2)'; };
    const handleBlur = e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none'; };

    return (
        <div style={S.page}>
            <div style={S.blob1} />
            <div style={S.blob2} />

            <div style={S.card}>
                <div style={S.iconWrap}>🎵</div>
                <h1 style={S.title}>Tạo tài khoản</h1>
                <p style={S.sub}>Tham gia <span style={{ color: '#f472b6', fontWeight: 700 }}>TechZone</span> ngay hôm nay</p>

                <form onSubmit={onFinish}>
                    <div style={S.inputWrap}>
                        <label style={S.label}>Họ và tên</label>
                        <input name="name" type="text" required placeholder="Nguyễn Văn A" style={S.input} onFocus={handleFocus} onBlur={handleBlur} />
                    </div>

                    <div style={S.inputWrap}>
                        <label style={S.label}>Email</label>
                        <input name="email" type="email" required placeholder="name@company.com" style={S.input} onFocus={handleFocus} onBlur={handleBlur} />
                    </div>

                    <div style={S.inputWrap}>
                        <label style={S.label}>Mật khẩu</label>
                        <div style={{ position: 'relative' }}>
                            <input name="password" type={showPass ? 'text' : 'password'} required placeholder="••••••••" style={{ ...S.input, paddingRight: 50 }} onFocus={handleFocus} onBlur={handleBlur} />
                            <button type="button" onClick={() => setShowPass(v => !v)}
                                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 18, padding: 0 }}>
                                {showPass ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={S.btn}
                        onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(236,72,153,.4)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                        {loading ? 'Đang xử lý...' : 'Đăng ký thành viên →'}
                    </button>
                </form>

                <div style={S.divider} />

                <div style={S.linkRow}>
                    Đã có tài khoản?{' '}
                    <Link to="/login" style={{ color: '#f472b6', fontWeight: 700, textDecoration: 'none' }}>Đăng nhập tại đây</Link>
                </div>
                <div style={{ ...S.linkRow, marginTop: 14 }}>
                    <Link to="/" style={{ color: '#475569', fontSize: 13, textDecoration: 'none' }}>← Quay lại trang chủ</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;