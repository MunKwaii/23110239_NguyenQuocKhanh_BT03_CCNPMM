import { useState } from 'react';
import { Button, Col, Form, Input, notification, Row, Steps } from 'antd';
import { forgotPasswordApi, resetPasswordApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [email, setEmail] = useState("");

    const onFinishEmail = async (values) => {
        const { email } = values;
        const res = await forgotPasswordApi(email);

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
        const res = await resetPasswordApi(email, password);

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

    return (
        <Row justify={"center"} style={{ marginTop: "30px" }}>
            <Col xs={24} md={16} lg={8}>
                <fieldset style={{
                    padding: "15px",
                    margin: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "5px"
                }}>
                    <legend>Quên Mật Khẩu</legend>
                    
                    <Steps
                        current={current}
                        items={[
                            { title: 'Xác nhận Email' },
                            { title: 'Đặt lại Mật khẩu' },
                        ]}
                        style={{ marginBottom: "20px" }}
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
                                <Input />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
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
                            <div style={{ marginBottom: "15px" }}>Email: <b>{email}</b></div>
                            <Form.Item
                                label="Mật khẩu mới"
                                name="password"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                            >
                                <Input.Password />
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
                                <Input.Password />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Đổi mật khẩu
                                </Button>
                            </Form.Item>
                        </Form>
                    )}

                    <Link to={"/login"}><ArrowLeftOutlined /> Quay lại đăng nhập</Link>
                </fieldset>
            </Col>
        </Row>
    );
};

export default ForgotPasswordPage;
