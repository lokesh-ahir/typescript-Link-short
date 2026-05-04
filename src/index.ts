import { app, initializeConnections } from './app';

const PORT = process.env.PORT || 3000;

const start = async () => {
  await initializeConnections();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
  });
};

start().catch(err => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
