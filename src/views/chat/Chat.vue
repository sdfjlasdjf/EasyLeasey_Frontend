<template>
  <div class="chat-list-container">
    <h2>Your Conversations</h2>
    <el-list>
      <el-list-item
        v-for="conversation in conversations"
        :key="conversation.id"
        @click="goToConversation(conversation.id)"
      >
        <el-list-item-content>
          <el-list-item-title>
            Conversation {{ conversation.id }}
          </el-list-item-title>
          <el-list-item-description>
            Last message: {{ conversation.lastMessage }}
          </el-list-item-description>
        </el-list-item-content>
      </el-list-item>
    </el-list>
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
}

.el-list-item {
  cursor: pointer;
}

.el-list-item:hover {
  background-color: #f5f5f5;
}
</style>
