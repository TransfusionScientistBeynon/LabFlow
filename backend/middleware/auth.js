const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const authMiddleware = jwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: "https://labdash.uk.auth0.com/.well-known/jwks.json",
    cache: true,
    rateLimit: true,
  }),
  audience: "https://labdashapi",
  issuer: "https://labdash.uk.auth0.com/",
  algorithms: ["RS256"],
});

module.exports = authMiddleware;