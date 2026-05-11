const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUserService = async (name, email, password) => {
    try {
        // Kiểm tra xem email đã tồn tại trong DB chưa
        const user = await User.findOne({ email });
        if (user) {
            console.log(`User exist, chọn email khác: ${email}`);
            return null;
        }

        // Mã hóa mật khẩu (hash password)
        const hashPassword = await bcrypt.hash(password, 10);

        // Lưu user mới vào cơ sở dữ liệu
        let result = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "quản trị viên"
        });
        return result;

    } catch (error) {
        console.log(error);
        return null;
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
                    name: user.name
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
                        name: user.name
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
        return null;
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

// Xuất các hàm ra để controller sử dụng
module.exports = {
    createUserService,
    loginService,
    getUserService
}