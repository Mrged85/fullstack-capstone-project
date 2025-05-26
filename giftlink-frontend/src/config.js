// giftlink-frontend/src/config.js
const config = {
    backendUrl: process.env.REACT_APP_BACKEND_URL,
    imageUrl: process.env.REACT_APP_BACKEND_URL // Assumo que as imagens também vêm do backend
};

console.log(`backendUrl in config.js: ${config.backendUrl}`) // Excelente para depuração
export {config as urlConfig}