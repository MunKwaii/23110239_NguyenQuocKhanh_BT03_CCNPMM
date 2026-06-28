import { useState } from 'react';
import { Button, Form, Input, notification, Steps } from 'antd';
import { forgotPasswordApi, resetPasswordApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const onFinishEmail = async (values) => {
        const { email } = values;
        setLoading(true);
        const res = await forgotPasswordApi(email);
        setLoading(false);

        if (res && res.EC === 0) {
            notification.success({
                message: "Quên Mật Khẩu",
                description: res.EM
            });
            setEmail(email);
            setCurrent(1);
        } else {
            notification.error({
                message: "Quên Mật Khẩu",
                description: res?.EM ?? "Lỗi"
            });
        }
    };

    const onFinishReset = async (values) => {
        const { password } = values;
        setLoading(true);
        const res = await resetPasswordApi(email, password);
        setLoading(false);

        if (res && res.EC === 0) {
            notification.success({
                message: "Đặt Lại Mật Khẩu",
                description: res.EM
            });
            navigate("/login");
        } else {
            notification.error({
                message: "Đặt Lại Mật Khẩu",
                description: res?.EM ?? "Lỗi"
            });
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
        divider: { borderTop: '1px solid #1e293b', margin: '28px 0' },
        btn: {
            width: '100%',
            height: '48px',
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: 8,
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }
    };

    return (
        <div style={S.page}>
            <div style={S.blob1} />
            <div style={S.blob2} />

            <style>{`
                .forgot-password-card .ant-form-item-label > label {
                    color: #94a3b8 !important;
                    font-size: 13px !important;
                    font-weight: 700 !important;
                }
                .forgot-password-card .ant-input, 
                .forgot-password-card .ant-input-affix-wrapper {
                    background: rgba(15,23,42,.6) !important;
                    border: 1px solid #334155 !important;
                    color: #f1f5f9 !important;
                    border-radius: 12px !important;
                    padding: 10px 14px !important;
                }
                .forgot-password-card .ant-input-affix-wrapper .ant-input {
                    padding: 0 !important;
                    border: none !important;
                }
                .forgot-password-card .ant-input:focus, 
                .forgot-password-card .ant-input-focused,
                .forgot-password-card .ant-input-affix-wrapper-focused {
                    border-color: #7c3aed !important;
                    box-shadow: 0 0 0 3px rgba(124,58,237,.2) !important;
                }
                .forgot-password-card .ant-input-password-icon {
                    color: #64748b !important;
                }
                .forgot-password-card .ant-form-item-explain-error {
                    color: #f87171 !important;
                    font-size: 12px !important;
                    margin-top: 4px !important;
                }
                .forgot-password-steps .ant-steps-item-title {
                    color: #64748b !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                }
                .forgot-password-steps .ant-steps-item-active .ant-steps-item-title {
                    color: #f1f5f9 !important;
                    font-weight: 800 !important;
                }
                .forgot-password-steps .ant-steps-item-finish .ant-steps-item-title {
                    color: #a78bfa !important;
                }
                .forgot-password-steps .ant-steps-item-icon {
                    border-color: #334155 !important;
                    background: rgba(15,23,42,.6) !important;
                }
                .forgot-password-steps .ant-steps-item-icon .ant-steps-icon {
                    color: #64748b !important;
                }
                .forgot-password-steps .ant-steps-item-active .ant-steps-item-icon {
                    border-color: #7c3aed !important;
                    background: #7c3aed !important;
                }
                .forgot-password-steps .ant-steps-item-active .ant-steps-item-icon .ant-steps-icon {
                    color: #fff !important;
                }
                .forgot-password-steps .ant-steps-item-finish .ant-steps-item-icon {
                    border-color: #a78bfa !important;
                    background: #a78bfa !important;
                }
                .forgot-password-steps .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon {
                    color: #0f172a !important;
                }
                .forgot-password-steps .ant-steps-item-tail::after {
                    background-color: #334155 !important;
                }
                .forgot-password-steps .ant-steps-item-finish + .ant-steps-item-active .ant-steps-item-tail::after {
                    background-color: #7c3aed !important;
                }
            `}</style>

            <div style={S.card} className="forgot-password-card">
                <div style={S.iconWrap}>🔑</div>
                <h1 style={S.title}>Quên mật khẩu</h1>
                <p style={S.sub}>Đặt lại quyền truy cập vào tài khoản <span style={{ color: '#a78bfa', fontWeight: 700 }}>TechZone</span></p>

                <Steps
                    current={current}
                    items={[
                        { title: 'Xác nhận Email' },
                        { title: 'Đặt lại Mật khẩu' },
                    ]}
                    className="forgot-password-steps"
                    style={{ marginBottom: "36px" }}
                />

                {current === 0 && (
                    <Form
                        name="forgot-password"
                        onFinish={onFinishEmail}
                        autoComplete="off"
                        layout='vertical'
                    >
                        <Form.Item
                            label="Nhập Email của bạn"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input placeholder="name@company.com" />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button type="primary" htmlType="submit" style={S.btn} loading={loading}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(124,58,237,.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                Tiếp tục
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                {current === 1 && (
                    <Form
                        name="reset-password"
                        onFinish={onFinishReset}
                        autoComplete="off"
                        layout='vertical'
                    >
                        <div style={{ marginBottom: "20px", color: '#94a3b8', fontSize: '13px' }}>
                            Email xác nhận: <b style={{ color: '#f1f5f9' }}>{email}</b>
                        </div>
                        
                        <Form.Item
                            label="Mật khẩu mới"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                        >
                            <Input.Password placeholder="••••••••" />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu mới"
                            name="confirmPassword"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="••••••••" />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button type="primary" htmlType="submit" style={S.btn} loading={loading}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(124,58,237,.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                Đổi mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                <div style={S.divider} />

                <div style={{ textAlign: 'center' }}>
                    <Link to="/login" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#c084fc'}
                        onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
                    >
                        <ArrowLeftOutlined /> Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
