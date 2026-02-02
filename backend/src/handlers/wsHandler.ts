import type { ServerWebSocket } from "bun";
import type { WSData, Client } from "../types";
import { ClientManager } from "../services/ClientManager";
import type { MessageStore } from "../services/MessageStore";

export function createWSHandlers(clientManager: ClientManager, messageStore: MessageStore) {
  return {
    open(ws: ServerWebSocket<WSData>) {
      const id = ws.data.id;
      const roomId = ws.data.roomId;

      // Получаем существующих клиентов в комнате ДО добавления нового
      const existingClients = clientManager.getClientsByRoom(roomId);

      const client: Client = {
        id: id,
        roomId: roomId,
        ws: ws,
      };
      clientManager.addClient(client);

      console.log(`✅ Client ${id} joined room ${roomId}. Total clients in room: ${existingClients.length + 1}`);

      // Отправляем собственный ID
      ws.send(JSON.stringify({ type: "peer-id", peerId: id }));

      // Отправляем историю сообщений комнаты
      const roomHistory = messageStore.getMessagesByRoom(roomId);
      if (roomHistory.length > 0) {
        ws.send(JSON.stringify({ 
          type: "message-history", 
          messages: roomHistory 
        }));
      }

      // Если уже есть кто-то в комнате (P2P логика - только 2 пира)
      if (existingClients.length > 0) {
        const otherPeer: Client | undefined = existingClients[0];
        
        if (otherPeer) {
          // Уведомляем нового пира о существующем
          ws.send(JSON.stringify({ 
            type: "peer-connected", 
            peerId: otherPeer.id 
          }));
          
          // Уведомляем существующего пира о новом
          try {
            if (otherPeer.ws.readyState === 1) { // WebSocket.OPEN
              otherPeer.ws.send(JSON.stringify({ 
                type: "peer-connected", 
                peerId: id 
              }));
              console.log(`📢 Both peers notified: ${otherPeer.id} <-> ${id}`);
            } else {
              console.warn(`⚠️ Other peer ${otherPeer.id} WebSocket not open`);
            }
          } catch (err) {
            console.error(`❌ Failed to notify existing peer:`, err);
          }
        }
      }
    },

    message(ws: ServerWebSocket<WSData>, msg: string) {
      let data: any;
      try {
        data = JSON.parse(msg.toString());
      } catch (err) {
        console.error(`❌ Failed to parse message from ${ws.data.id}:`, err);
        ws.send(JSON.stringify({ 
          type: "error", 
          error: "Invalid JSON format" 
        }));
        return;
      }

      const roomId = ws.data.roomId;
      const fromId = ws.data.id;
      console.log(`[${new Date().toISOString()}] Message from ${fromId} in room ${roomId}, type: ${data.type}, to: ${data.to || "none"}`);

      // ICE candidates отправляем конкретному пиру
      if (data.type === "ice-candidate" && data.to) {
        const targetClient = clientManager.getClient(data.to);
        if (targetClient) {
          try {
            if (targetClient.ws.readyState === 1) { // WebSocket.OPEN
              console.log(`  → Forwarding ICE candidate to ${data.to}`);
              targetClient.ws.send(JSON.stringify({
                type: data.type,
                from: fromId,
                payload: data.payload,
              }));
            } else {
              console.log(`  → Target client ${data.to} WebSocket not open`);
            }
          } catch (err) {
            console.error(`  ❌ Failed to send ICE candidate to ${data.to}:`, err);
          }
        } else {
          console.log(`  → Target client ${data.to} not found!`);
        }
        return;
      }

      // Hang-up signal отправляем конкретному пиру или бродкастим
      if (data.type === "hang-up") {
        const clients = clientManager.getClientsByRoom(roomId);
        console.log(`  → Broadcasting hang-up signal to ${clients.length} clients in room`);
        for (const client of clients) {
          if (client.id !== fromId) {
            try {
              if (client.ws.readyState === 1) { // WebSocket.OPEN
                // Отправляем hang-up сигнал
                client.ws.send(JSON.stringify({
                  type: "hang-up",
                  from: fromId,
                }));
                // Затем закрываем комнату для обоих пиров
                setTimeout(() => {
                  if (client.ws.readyState === 1) {
                    client.ws.send(JSON.stringify({
                      type: "room-closed",
                      reason: "call-ended"
                    }));
                  }
                }, 100);
              }
            } catch (err) {
              console.error(`  ❌ Failed to send hang-up to ${client.id}:`, err);
            }
          }
        }
        return;
      }

      // Offer и Answer отправляем конкретному пиру
      if ((data.type === "offer" || data.type === "answer") && data.to) {
        const targetClient = clientManager.getClient(data.to);
        if (targetClient) {
          try {
            if (targetClient.ws.readyState === 1) { // WebSocket.OPEN
              console.log(`  → Forwarding ${data.type.toUpperCase()} to ${data.to}`);
              targetClient.ws.send(JSON.stringify({
                type: data.type,
                from: fromId,
                payload: data.payload,
              }));
            } else {
              console.log(`  → Target client ${data.to} WebSocket not open`);
            }
          } catch (err) {
            console.error(`  ❌ Failed to send ${data.type} to ${data.to}:`, err);
          }
        } else {
          console.log(`  → Target client ${data.to} not found!`);
        }
        return;
      }

      // Offer/Answer БЕЗ to - это ошибка, логируем
      if (data.type === "offer" || data.type === "answer") {
        console.log(`  ⚠️ ${data.type.toUpperCase()} received without 'to' field!`);
      }

      // Сохраняем только чат сообщения в историю
      if (data.type === "chat") {
        const message = {
          type: data.type,
          from: fromId,
          payload: data.payload,
          roomId: roomId,
        };
        messageStore.addMessage(message);
        const broadcastMsg = JSON.stringify(message);
        clientManager.broadcastToRoom(roomId, broadcastMsg);
        console.log(`  → Chat message broadcasted to room`);
      }
    },

    close(ws: ServerWebSocket<WSData>) {
      const roomId = ws.data.roomId;
      const peerId = ws.data.id;
      clientManager.removeClient(peerId);
      
      // Проверяем, остались ли еще клиенты в комнате
      const remainingClients = clientManager.getClientsByRoom(roomId);
      
      if (remainingClients.length === 0) {
        // Комната пуста - удаляем историю
        messageStore.clearMessagesByRoom(roomId);
        console.log(`Room ${roomId} deleted (no clients)`);
      } else if (remainingClients.length === 1) {
        // Один клиент остался - уведомляем его что комната удалена
        const lastClient = remainingClients[0];
        if (lastClient) {
          try {
            if (lastClient.ws.readyState === 1) { // WebSocket.OPEN
              lastClient.ws.send(JSON.stringify({ 
                type: "room-closed", 
                reason: "peer-disconnected" 
              }));
              console.log(`Notified last client in room ${roomId}`);
            }
          } catch (err) {
            console.error(`❌ Failed to notify last client in room ${roomId}:`, err);
          }
        }
      }
    },
  };
}
