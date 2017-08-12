const fallbackAdminUsersJson = JSON.stringify({ admin: 'admin' });

const adminUsers = process.env.ADMIN_USERS_JSON || fallbackAdminUsersJson;
const mongo = process.env.MONGO || 'mongodb://localhost/soclose';
const redis = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
};
const port = Number(process.env.PORT || 3000);
const disableMorgan = process.env.DISABLE_MORGAN || false;

export {
  adminUsers,
  mongo,
  redis,
  port,
  disableMorgan,
};
