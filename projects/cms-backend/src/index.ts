// Server entry: use app + ready()
import dotenv from 'dotenv';
import { app, ready } from './app';

dotenv.config();

const PORT = process.env.PORT || 4001;

const startServer = async () => {
  try {
    await ready();
    console.log('App is ready');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();




