import EventEmitter from 'node:events';

export const notificationEmitter = new EventEmitter();

//Listeners
notificationEmitter.on('user:registered', (user) => {
  console.log(`Email enviado a ${user.email} con código de verificación: ${user.code}`);
});

notificationEmitter.on('user:verified', (user) => {
  console.log(`Usuario verificado: ${user.email}`);
});
/*
notificationEmitter.on('user:deleted', (user) => {
  console.log(`Usuario eliminado: ${user.email}`);
});

notificationEmitter.on('user:invited', (user) => {
  console.log(`Usuario invitado: ${user.email}`);
});
*/
