import mongoose from 'mongoose';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const dbConnect = async () => {
    const DB_URI = process.env.DB_URI;
    
    if(!DB_URI){
        console.error('ERROR. DB_URI no está definida en .env');
        process.exit(1);
    }

    try{
        await mongoose.connect(DB_URI);
        console.log('Conectado a MongoDB');
    } catch(error){
        console.error('Error conectando a MongoDB: ', error.message);
        process.exit(1);
    }
};

// Eventos de conexion
mongoose.connection.on('disconnected', () => {
    console.warn('Desconectado de MongoDB');
});

mongoose.connection.on('error', (err) => {
   console.error('ERROR en MongoDB: ', err.message); 
});

// Cerrar conexion al terminar
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Conexion a MongoDB cerrada');
    process.exit(0);
})

export default dbConnect;