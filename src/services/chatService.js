// src/services/chatService.js

import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { ref } from 'vue';
import { useTokenStore } from '@/stores/token.js';

const stompClient = ref(null);
const connected = ref(false);

let onMessageReceivedCallback = null;

export const connect = () => {
  if (connected.value) {
    return;
  }

  const tokenStore = useTokenStore();
  const token = tokenStore.token;

  const socket = new SockJS('http://localhost:8080/ws-chat'); // Adjust the URL based on your backend
  stompClient.value = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000, // Optional: Auto reconnect after 5 seconds
    connectHeaders: {
      Authorization: `Bearer ${token}`, // Include token if required
    },
    debug: (str) => {
      console.log(str);
    },
  });

  stompClient.value.onConnect = (frame) => {
    connected.value = true;
    console.log('Connected: ' + frame);

    // Subscribe to receive messages sent to the user
    stompClient.value.subscribe('/user/queue/messages', onMessageReceived);
  };

  stompClient.value.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
  };

  stompClient.value.activate();
};

const onMessageReceived = (message) => {
  const body = JSON.parse(message.body);
  if (onMessageReceivedCallback) {
    onMessageReceivedCallback(body);
  }
};

export const sendMessage = (chatMessage) => {
  if (stompClient.value && stompClient.value.connected) {
    stompClient.value.publish({
      destination: '/app/sendMessage',
      body: JSON.stringify(chatMessage),
    });
  } else {
    console.error('Not connected to WebSocket server.');
  }
};

export const disconnect = () => {
  if (stompClient.value !== null) {
    stompClient.value.deactivate();
  }
  connected.value = false;
  console.log('Disconnected from WebSocket');
};

export const setOnMessageReceived = (callback) => {
  onMessageReceivedCallback = callback;
};
