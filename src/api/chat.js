// src/api/chat.js

import request from '@/utils/request.js';


export const getUserConversations = () => {
  return request.get('/conversations/list');
};

export const getConversationMessages = (conversationId) => {
  return request.get(`/chat/history/${conversationId}`);
};

// Add this function
export const getOrCreateConversation = (participantId) => {
    return request.post(`/conversations/getorcreate?participantId=${participantId}`);
};

  
  