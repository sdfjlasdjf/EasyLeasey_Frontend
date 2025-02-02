<template>
  <div class="chat-list-container">
    <h2 class="title">Your Conversations</h2>
    <div class="conversation-list">
      <el-card
        v-for="conversation in conversations"
        :key="conversation.id"
        class="conversation-card"
        shadow="never"
        @click="goToConversation(conversation.id)"
      >
        <div class="conversation-info">
          <span class="conversation-title">Conversation {{ conversation.id }}</span>
          <span class="last-message">
            Last message: {{ conversation.lastMessage || 'No messages yet' }}
          </span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserConversations } from '@/api/chat.js';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const conversations = ref([]);

const loadConversations = async () => {
  try {
    const result = await getUserConversations();
    conversations.value = result.data;
  } catch (error) {
    ElMessage.error('Failed to load conversations.');
  }
};

const goToConversation = (conversationId) => {
  router.push(`/chatroom/${conversationId}`);
};

onMounted(() => {
  loadConversations();
});
</script>

<style scoped>
.chat-list-container {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.conversation-list {
  display: flex;
  flex-direction: column;
}

.conversation-card {
  cursor: pointer;
  border-radius: 0;
  transition: background-color 0.2s;
  padding: 10px 15px;
  border: 1px solid #ddd;
  margin: 0;
}

.conversation-card:hover {
  background-color: #f5f5f5;
}

.conversation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversation-title {
  font-size: 16px;
  font-weight: bold;
}

.last-message {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}
</style>
