import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(env.PORT, () => {
      console.log(`\n✨ GlowCare API Server running on http://localhost:${env.PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Client URL: ${env.CLIENT_URL}`);
      console.log(`   API Base: http://localhost:${env.PORT}/api/v1\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
