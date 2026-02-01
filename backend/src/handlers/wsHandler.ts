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
          otherPeer.ws.send(JSON.stringify({ 
            type: "peer-connected", 
            peerId: id 
          }));
        }
      }
    },

    message(ws: ServerWebSocket<WSData>, msg: string) {
      const data = JSON.parse(msg.toString());
      const roomId = ws.data.roomId;
      const fromId = ws.data.id;
      console.log("Message from", fromId, "in room", roomId, "type:", data.type);

      // ICE candidates отправляем конкретному пиру
      if (data.type === "ice-candidate" && data.to) {
        const targetClient = clientManager.getClient(data.to);
        if (targetClient) {
          targetClient.ws.send(JSON.stringify({
            type: data.type,
            from: fromId,
            payload: data.payload,
          }));
        }
        return;
      }

      // Offer и Answer отправляем конкретному пиру
      if ((data.type === "offer" || data.type === "answer") && data.to) {
        const targetClient = clientManager.getClient(data.to);
        if (targetClient) {
          targetClient.ws.send(JSON.stringify({
            type: data.type,
            from: fromId,
            payload: data.payload,
          }));
        }
        return;
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
        lastClient.ws.send(JSON.stringify({ 
          type: "room-closed", 
          reason: "peer-disconnected" 
        }));
        console.log(`Notified last client in room ${roomId}`);
      }
    },
  };
}
