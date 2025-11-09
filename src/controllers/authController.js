const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({
            status: 0,
            message: "User already exists"
        });

        const user = await User.create({ name, email, password });
        res.json({
            status: 1,
            message: "Registered successfully",
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
            status: 0,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({
            message: "User not found",
            status: 0,
        });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({
            status: 0,
            message: "Invalid password"
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "4h" });
        res.json({
            status: 1,
            message: "Success",
            token
        });
    } catch (err) {
        res.status(500).json({
            status: 0,
            message: err.message
        });
    }
};

exports.logout = async (req, res) => {
    // client side can just delete token; server-based logout needs token blacklist
    res.json({
        status: 1,
        message: "Logged out successfully"
    });
};
