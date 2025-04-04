const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const accessToken = req.header('Authorization')?.replace('Bearer ', '');

    if (accessToken) {
        try {
            jwt.verify(accessToken, process.env.JWT_SECRET);
            next(); // access token 有效，繼續處理請求
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                const refreshToken = req.cookies.refreshToken;

                if (refreshToken) {
                    try {
                        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
                        const username = decoded.username;

                        // 驗證 refresh token (例如，檢查是否在資料庫中)
                        // 若您使用redis，請在此處進行驗證
                        // ...

                        const newAccessToken = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '5m' });
                        const newRefreshToken = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' });

                        res.cookie('refreshToken', newRefreshToken, {
                            httpOnly: true,
                            secure: true,
                            sameSite: 'strict',
                        });

                        req.headers.authorization = `Bearer ${newAccessToken}`; // 使用新的 access token 更新請求標頭
                        next(); // 繼續處理請求
                    } catch (refreshErr) {
                        return res.status(401).json({ message: 'Invalid refresh token' });
                    }
                } else {
                    return res.status(401).json({ message: 'Refresh token is missing' });
                }
            } else {
                return res.status(401).json({ message: 'Invalid access token' });
            }
        }
    } else {
        return res.status(401).json({ message: 'Access token is missing' });
    }
};

module.exports = authMiddleware;