const os = require('os');

// Function to get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name in interfaces) {
    const iface = interfaces[name];
    
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        // Skip Docker and virtual interfaces
        if (!name.toLowerCase().includes('docker') && 
            !name.toLowerCase().includes('vbox') &&
            !name.toLowerCase().includes('vmware')) {
          return alias.address;
        }
      }
    }
  }
  
  return 'localhost';
}

const localIP = getLocalIP();
console.log(`Your local IP address is: ${localIP}`);
console.log(`Update this in src/constants/network.ts if using Expo Go on mobile`);
console.log(`API will be available at: http://${localIP}:3001`);

module.exports = { getLocalIP };
