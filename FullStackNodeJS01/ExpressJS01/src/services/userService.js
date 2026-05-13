const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUserService = async (name, email, password) => {
    try {
        // Kiểm tra xem email đã tồn tại trong DB chưa
        const user = await User.findOne({ email });
        if (user) {
            return {
                EC: 1,
                EM: "Email đã tồn tại, vui lòng chọn email khác"
            }
        }

        // Mã hóa mật khẩu (hash password)
        const hashPassword = await bcrypt.hash(password, 10);

        // Lưu user mới vào cơ sở dữ liệu
        let result = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "USER"
        });
        return {
            EC: 0,
            data: result
        };

    } catch (error) {
        console.log(error);
        return {
            EC: -1,
            EM: "Đã có lỗi xảy ra ở phía server"
        };
    }
}

const loginService = async (email, password) => {
    try {
        // Tìm user theo email
        const user = await User.findOne({ email: email });
        if (user) {
            // So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return {
                    EC: 2,
                    EM: "Email/Password không hợp lệ"
                }
            } else {
                // Tạo access token (JWT)
                const payload = {
                    email: user.email,
                    name: user.name,
                    role: user.role || "USER"
                }
                const access_token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRE }
                );

                return {
                    EC: 0,
                    access_token,
                    user: {
                        email: user.email,
                        name: user.name,
                        role: user.role || "USER"
                    }
                }
            }
        } else {
            return {
                EC: 1,
                EM: "Email/Password không hợp lệ"
            }
        }
    } catch (error) {
        console.log(error);
        return {
            EC: -1,
            EM: "Đã có lỗi xảy ra ở phía server"
        };
    }
}

const getUserService = async () => {
    try {
        // Lấy danh sách user, dùng .select("-password") để không trả về trường password
        let result = await User.find({}).select("-password");
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const forgotPasswordService = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại trong hệ thống"
            }
        }
        // Trong thực tế, bạn sẽ gửi email chứa link reset password ở đây
        // Ở đây chúng ta chỉ thông báo thành công
        return {
            EC: 0,
            EM: "Xác nhận email thành công. Vui lòng đặt lại mật khẩu mới."
        }
    } catch (error) {
        console.log(error);
        return {
            EC: -1,
            EM: "Lỗi server"
        }
    }
}

const resetPasswordService = async (email, newPassword) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại"
            }
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ email }, { password: hashPassword });

        return {
            EC: 0,
            EM: "Đổi mật khẩu thành công"
        }
    } catch (error) {
        console.log(error);
        return {
            EC: -1,
            EM: "Lỗi server"
        }
    }
}

// Xuất các hàm ra để controller sử dụng
module.exports = {
    createUserService,
    loginService,
    getUserService,
    forgotPasswordService,
    resetPasswordService
}