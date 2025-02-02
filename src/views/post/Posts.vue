<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { postListService, postDetailService, postIsLikedService, likePostService} from '@/api/post.js'
import { useRouter, useRoute } from 'vue-router'
import useUserInfoStore from '@/stores/userInfo.js'
const userInfoStore = useUserInfoStore()
import { ElIcon } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { getOrCreateConversation } from '@/api/chat.js'; // Import the API function

const router = useRouter()
const route = useRoute()

// Data models
const activeCategory = ref('places')
const posts = ref([])
const location = ref('')
const postDetailDialogVisible = ref(false)
const selectedPost = ref(null) // Stores details of the clicked post
const isLiked = ref(false) // Tracks whether the post is liked

// Initialize state from localStorage
const initializeState = () => {
    const storedCategory = localStorage.getItem('posts_activeCategory')
    const storedLocation = localStorage.getItem('posts_location')
    const storedPosts = localStorage.getItem('posts_posts')

    if (storedCategory) {
        activeCategory.value = storedCategory
    }

    if (storedLocation) {
        location.value = storedLocation
    } else {
        const userInfo = userInfoStore.info
        location.value = userInfo.location || ''
    }

    if (storedPosts) {
        posts.value = JSON.parse(storedPosts)
    }
}

// Fetch posts based on active category and location
const fetchPosts = async () => {
    try {
        const result = await postListService({ location: location.value, category: activeCategory.value })
        posts.value = result.data

        // Save to localStorage
        localStorage.setItem('posts_activeCategory', activeCategory.value)
        localStorage.setItem('posts_location', location.value)
        localStorage.setItem('posts_posts', JSON.stringify(posts.value))
    } catch (error) {
        ElMessage.error('Failed to load posts.')
    }
}

// Fetch posts on component mount
onMounted(() => {
    initializeState()
    fetchPosts()
})

// Watch for category changes
watch(activeCategory, () => {
    fetchPosts()
})

// Navigate to post details
const fetchPostDetails = async (postId) => {
    try {
        const result = await postDetailService(postId)
        selectedPost.value = result.data
        postDetailDialogVisible.value = true
        const result1 = await postIsLikedService(postId)
        isLiked.value = result1.data
    } catch (error) {
        ElMessage.error('Failed to load post details.')
    }
}

const toggleLike = async () => {
    try {
        // Send the opposite of the current state

        console.log("isLiked:",isLiked.value)
        await likePostService(selectedPost.value.id, isLiked.value)
        isLiked.value = !isLiked.value
        ElMessage.success(isLiked.value ? 'Post liked!' : 'Like removed.')
    } catch (error) {
        ElMessage.error('Failed to like the post.')
    }
}

// Navigate to chat with post owner

// Change category
const changeCategory = (category) => {
    activeCategory.value = category
}
const chatWithOwner = async (ownerId) => {
  try {
    if (ownerId === userInfoStore.info.id) {
      ElMessage.warning('You cannot chat with yourself.');
      return;
    }
    const result = await getOrCreateConversation(ownerId);
    const conversationId = result.data;
    router.push(`/chatroom/${conversationId}`);
  } catch (error) {
    ElMessage.error('Failed to start chat.');
  }
};
</script>

<template>
    <!-- Top bar with category buttons -->
    <div class="top-bar">
        <el-button-group>
            <el-button
                :type="activeCategory === 'places' ? 'primary' : 'default'"
                @click="changeCategory('places')"
            >
                Finding Places
            </el-button>
            <el-button
                :type="activeCategory === 'roommates' ? 'primary' : 'default'"
                @click="changeCategory('roommates')"
            >
                Looking for Roommates
            </el-button>
            <el-button
                :type="activeCategory === 'furniture' ? 'primary' : 'default'"
                @click="changeCategory('furniture')"
            >
                Secondhand Furniture
            </el-button>
        </el-button-group>
    </div>

    <!-- Location Input and Search Button -->
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>Location: {{ location }}</span>
                <el-input
                    v-model="location"
                    placeholder="Enter location"
                    @keyup.enter="fetchPosts"
                    class="location-input"
                />
                <el-button type="primary" @click="fetchPosts">Search</el-button>
            </div>
        </template>

        <!-- Post Grid -->
        <div class="post-grid">
            <div
                v-for="post in posts"
                :key="post.id"
                class="post-card"
                @click="fetchPostDetails(post.id)"
            >
                <el-card shadow="hover">
                    <img :src="post.image" alt="Post Image" class="post-image" />
                    <div class="post-title">{{ post.title }}</div>
                    <!-- Display price if available -->
                    <div v-if="post.price" class="post-price">Price: ${{ post.price }}</div>
                </el-card>
            </div>
        </div>
    </el-card>
    <el-dialog title="Post Details" v-model="postDetailDialogVisible" width="40%">
        <div v-if="selectedPost">
            <img :src="selectedPost.coverImg" alt="Post Image" class="detail-image" />
            <div class="detail-title">{{ selectedPost.title }}</div>
            <div class="detail-content">{{ selectedPost.content }}</div>
            <div class="detail-location">Location: {{ selectedPost.location }}</div>
            <div v-if="selectedPost.price" class="detail-price">Price: ${{ selectedPost.price }}</div>
        </div>
        <template #footer>
            <el-button @click="chatWithOwner(selectedPost.userId)">Chat with Owner</el-button>
            <el-icon @click="toggleLike" class="like-icon">
                <component :is="isLiked ? StarFilled : Star" />
            </el-icon>
        </template>
    </el-dialog>
</template>

<style scoped lang="scss">
.like-icon {
    font-size: 24px;
    cursor: pointer;
    color: goldenrod;
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.2);
    }
}

.top-bar {
    background-color: #fff;
    padding: 10px 20px;
    margin-bottom: 0px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .el-button-group {
        width: 100%;
        display: flex;
        justify-content: space-between;

        .el-button {
            flex: 1;
            margin: 0 5px;
            border-radius: 0;
            background-color: #f5f5f5;
            color: #333;

            &.el-button--primary {
                background-color: #409eff;
                color: #fff;
            }

            &:hover {
                background-color: #66b1ff;
                color: #fff;
            }
        }
    }
}

.page-container {
    min-height: 100%;
    margin-top: 20px;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .location-input {
            width: 300px;
        }
    }
    .post-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
        margin-top: 20px;
        overflow-y: scroll;
        height: calc(100vh - 300px); /* Adjust for header and top bar */
        align-items: start;
    }
    .post-card {
        cursor: pointer;
        height: auto;
    }
    .post-image {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
    }
    .post-title {
        margin-top: 8px;
        font-size: 14px;
        text-align: center;
        font-weight: bold;
    }
    .post-price {
        margin-top: 4px;
        font-size: 13px;
        color: #555;
        text-align: center;
    }
}
</style>
