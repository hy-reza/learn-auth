import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  console.log(process.env.ACCESS_TOKEN_SECRET);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.json(err);
    req.email = decoded.email;
    next();
  });
};
