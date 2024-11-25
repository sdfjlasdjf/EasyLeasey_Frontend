import { createRouter, createWebHistory } from 'vue-router'

// Import components
import LoginVue from '@/views/Login.vue'
import LayoutVue from '@/views/Layout.vue'

import PostsVue from '@/views/post/Posts.vue' // New Posts component
import ChatVue from '@/views/chat/Chat.vue';
import ChatRoom from '@/views/chat/ChatRoom.vue';

import UserProfileVue from '@/views/user/UserProfile.vue'
import UserAvatarVue from '@/views/user/UserAvatar.vue'
import UserResetPasswordVue from '@/views/user/UserResetPassword.vue'

// Define route relationships
const routes = [
    { path: '/login', component: LoginVue },
    {
        path: '/',
        component: LayoutVue,
        redirect: '/posts',
        children: [
            { path: '/posts', component: PostsVue },
            { path: '/user/profile', component: UserProfileVue },
            { path: '/user/avatar', component: UserAvatarVue },
            { path: '/user/resetPassword', component: UserResetPasswordVue },
            {
                path: '/chat',
                name: 'Chat',
                component: ChatVue,
                meta: {
                  requiresAuth: true, // Ensure only authenticated users can access
                },
            },
            {
                path: '/chatroom/:conversationId',
                name: 'ChatRoom',
                component: ChatRoom,
                meta: {
                  requiresAuth: true,
                },
            },
        ]
    }
]

// Create the router
const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

// Export the router
export default router
