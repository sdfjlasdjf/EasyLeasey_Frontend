<template>
  <div class="chatroom-container">
    <div class="chat-header">
      <el-button @click="goBack" icon="el-icon-arrow-left"></el-button>
      <span class="chat-title">Conversation {{ conversationId }}</span>
    </div>
    <div class="message-list" ref="messageList">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message-item', isMyMessage(message) ? 'my-message' : 'other-message']"
      >
        <div class="message-content">{{ message.content }}</div>
        <div class="message-time">{{ formatTimestamp(message.timestamp) }}</div>
      </div>
    </div>
    <div class="message-input">
      <el-input
        v-model="newMessage"
        placeholder="Type your message here..."
        @keyup.enter="handleSendMessage"
        class="message-input-field"
      />
      <el-button type="primary" @click="handleSendMessage" class="send-button">Send</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { connect, disconnect, sendMessage, setOnMessageReceived } from '@/services/chatService.js';
import { getConversationMessages } from '@/api/chat.js';
import useUserInfoStore from '@/stores/userInfo.js';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const userInfoStore = useUserInfoStore();
const userId = userInfoStore.info.id;
const route = useRoute();
const router = useRouter();
const conversationId = Number(route.params.conversationId);

const messages = ref([]);
const newMessage = ref('');

const messageList = ref(null);

const isMyMessage = (message) => message.senderId === userId;

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const handleSendMessage = () => {
  if (newMessage.value.trim() === '') return;

  const chatMessage = {
    content: newMessage.value,
    senderId: userId,
    conversationId: conversationId,
  };

  // Optimistically add the message to the chat
  const message = {
    ...chatMessage,
    timestamp: new Date().toISOString(),
  };
  messages.value.push(message);
  scrollToBottom();

  sendMessage(chatMessage);
  newMessage.value = '';
};

const loadConversationMessages = async () => {
  try {
    const result = await getConversationMessages(conversationId);
    messages.value = result.data;
    await nextTick();
    scrollToBottom();
  } catch (error) {
    ElMessage.error('Failed to load messages.');
  }
};

const onMessageReceived = (message) => {
  if (message.conversationId === conversationId) {
    messages.value.push(message);
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageList.value) {
      messageList.value.scrollTop = messageList.value.scrollHeight;
    }
  });
};

const goBack = () => {
  router.back();
};

onMounted(async () => {
  connect();
  setOnMessageReceived(onMessageReceived);
  await loadConversationMessages();
});

onUnmounted(() => {
  disconnect();
});
</script>

<style scoped>
.chatroom-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
}

.chat-title {
  font-weight: bold;
  margin-left: 10px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #ffffff;
}

.message-item {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  max-width: 70%; /* Restrict bubble width */
}

.my-message {
  align-self: flex-end;
  text-align: right;
}

.other-message {
  align-self: flex-start;
  text-align: left;
}

.message-content {
  display: inline-block;
  background-color: #409eff;
  color: #fff;
  padding: 8px 12px;
  border-radius: 15px;
  word-wrap: break-word; /* Allow wrapping for long words */
  max-width: 100%; /* Prevent stretching */
}

.my-message .message-content {
  background-color: #409eff;
  color: #fff;
  text-align: left;
  align-self: flex-end; /* Align bubble to the right */
}

.other-message .message-content {
  background-color: #f0f0f0;
  color: #000;
}

.message-time {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.message-input {
  display: flex;
  padding: 10px;
  background-color: #f5f5f5;
}

.message-input-field {
  flex: 1;
  margin-right: 10px;
}

.send-button {
  width: 80px;
}
</style>

