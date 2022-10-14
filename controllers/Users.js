import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({ attributes: ["id", "name", "email"] });
    res.json(users);
  } catch (err) {
    console.error(err);
  }
};

export const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Password not match" });
  }

  const salt = await bcrypt.genSalt();
  const hashPass = await bcrypt.hash(password, salt);

  try {
    await Users.create({ name, email, password: hashPass });
    res.json({ message: "Successfully registered !" });
  } catch (error) {
    console.error(error);
  }
};

export const login = async (req, res) => {
  try {
    const user = await Users.findAll({ where: { email: req.body.email } });
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match) {
      return res.status(400).json({ message: "email or password incorrect" });
    }
    const { id, name, email } = user[0];
    const accessToken = jwt.sign(
      { id, name, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );
    const refreshToken = jwt.sign(
      { id, name, email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    await Users.update(
      { refresh_token: refreshToken },
      {
        where: {
          id,
        },
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 1000,
      // secure: true
    });
    res
      .status(200)
      .json({ message: "Successfully login !", accessToken: accessToken });
  } catch (err) {
    res.status(404).json({ message: "Email not found" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    const user = await Users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });

    if (!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update(
      { refresh_token: null },
      {
        where: { id: userId },
      }
    );
    res.clearCookie("refreshToken");
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
  }
};
