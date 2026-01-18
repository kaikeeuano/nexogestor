module.exports = {
  port: process.env.PORT || 3000,
  secretKey: process.env.SECRET_KEY || 'CHANGE_THIS_IN_PRODUCTION',
  nodeEnv: process.env.NODE_ENV || 'production',
  database: {
    path: './data/agenda2.db'
  },
  uploads: {
    path: './uploads',
    maxFileSize: 5 * 1024 * 1024 // 5MB
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};
