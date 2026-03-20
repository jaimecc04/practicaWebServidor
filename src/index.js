// Puntos de entrada
import app from './app.js';
import dbConnect from './config/db.js';

// Inicio servidor
const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await dbConnect();
        app.listen(PORT, () => {
            console.log(`Servidor en http://localhost:${PORT}`);
            console.log(`API en http://localhost:${PORT}/api`);
        });
    } catch(error){
        console.error('ERROR al iniciar: ', error);
        process.exit(1);
    }
};

startServer();