import PocketBase from 'pocketbase';

const serverUrl = process.env.POCKETBASE_URL;

if (!serverUrl) {
  throw new Error('POCKETBASE_URL is not defined');
}

const pbServer = new PocketBase(serverUrl);

// Авторизация как админ через токен или логин/пароль
(async () => {
  try {
    const existing = pbServer.authStore.isValid;
    if (!existing) {
      const adminToken = process.env.POCKETBASE_ADMIN_TOKEN;
      if (adminToken) {
        pbServer.authStore.save(adminToken, null);
        return;
      }
      const email = process.env.POCKETBASE_ADMIN_EMAIL;
      const password = process.env.POCKETBASE_ADMIN_PASSWORD;
      if (email && password) {
        await pbServer.admins.authWithPassword(email, password);
      }
    }
  } catch (e) {
    console.error('PocketBase admin auth error', e);
  }
})();

export default pbServer;
