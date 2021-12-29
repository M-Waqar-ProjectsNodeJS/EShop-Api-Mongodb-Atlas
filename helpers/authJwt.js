const expressJwt = require("express-jwt");

const authJWT = () => {
  const secretKey = process.env.JWT_KEY;
  const api = process.env.API_URL;
  return expressJwt({
    secret: secretKey,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      //{ url: `${api}/product`, methods: ["GET", "OPTIONS"] },
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/product(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/category(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/order(.*)/, methods: ["GET", "OPTIONS", "POST"] },
      `${api}/user/login`,
      `${api}/user/register`,
    ],
  });
};

function isRevoked(req, payload, done) {
  // if you have multiple roles for the roiutes check here with req.url
  if (!payload.isAdmin) {
    done(null, true); // ignore the request
  }
  done(); // complete the request
}

module.exports = authJWT;
