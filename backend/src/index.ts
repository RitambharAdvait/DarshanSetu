//MAIN Server Entry point
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { MQTTIngestionService } from './services/mqtt.service';
import authRoutes from './routes/auth.routes';
import gateRoutes from './routes/gate.routes';
import ticketRoutes from './routes/ticket.routes';
import incidentRoutes from './routes/incident.routes';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/tickets', ticketRoutes);

app.use('/api/gates', gateRoutes);

app.use('/api/incidents', incidentRoutes);

// Initialize MQTT Ingestion Engine
new MQTTIngestionService(io);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`🔌 Client disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});