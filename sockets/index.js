const { Server } = require('socket.io');
const eventBus = require('./eventBus');

let ioInstance;

function initSocketServer(server) {
  if (!server || ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', socket => {
    socket.emit('connection:ack', { message: 'Welcome to Cineverse realtime channel' });

    socket.on('client:ping', payload => {
      socket.emit('server:pong', { ...payload, timestamp: Date.now() });
    });
  });

  eventBus.on('movie:created', payload => ioInstance.emit('movie:created', payload));
  eventBus.on('movie:updated', payload => ioInstance.emit('movie:updated', payload));
  eventBus.on('movie:deleted', payload => ioInstance.emit('movie:deleted', payload));
  eventBus.on('dashboard:metrics', payload => ioInstance.emit('dashboard:metrics', payload));

  return ioInstance;
}

function getIo() {
  return ioInstance;
}

module.exports = {
  initSocketServer,
  getIo
};
