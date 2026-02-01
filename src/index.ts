import { serve } from "bun";
import index from "./index.html";
import { networkInterfaces } from "os";

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0"; // Слушаем на всех интерфейсах для доступа с других устройств

const server = serve({
  port,
  hostname, // Позволяет доступ с других устройств в сети
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

// Определяем IP адреса для удобства
function getLocalIP(): string {
  try {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      const interfaces = nets[name];
      if (interfaces) {
        for (const net of interfaces) {
          if (net.family === 'IPv4' && !net.internal) {
            return net.address;
          }
        }
      }
    }
  } catch {
    // Игнорируем ошибки
  }
  return 'localhost';
}

const localIP = getLocalIP();

console.log(`🚀 Server running at http://localhost:${port}/`);
if (localIP !== 'localhost') {
  console.log(`🌐 Also available at http://${localIP}:${port}/`);
  console.log(`📱 Use this URL on your phone: http://${localIP}:${port}/`);
  console.log(`💡 Frontend will auto-detect API URL: http://${localIP}:3030`);
}
