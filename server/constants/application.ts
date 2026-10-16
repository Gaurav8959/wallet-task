const basePath = "/";

export default {
  url: {
    basePath,
  },
  timers: {
    jwtTokenExpiration: 60 * 60 * 24,
  },
  env: {
    authSecret: process.env.TOKEN_SECRET_KEY as string,
  },
  authorizationIgnorePath: ["/", "/auth/register", "/auth/login"],
};
