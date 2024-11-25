<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { postListService } from '@/api/post.js'
import { userInfoService } from '@/api/user.js'
import { useRouter } from 'vue-router'
import useUserInfoStore from '@/stores/userInfo.js'
const userInfoStore = useUserInfoStore();
// Data model for posts and location
const posts = ref([])
const location = ref('')

// Router for navigation
const router = useRouter()

// Fetch posts by location
const fetchPostsByLocation = async () => {
    try {
        const result = await postListService({ location: location.value, category: 'places' })
        posts.value = result.data
        // Save to localStorage to retain state
        localStorage.setItem('location', location.value)
        localStorage.setItem('posts', JSON.stringify(posts.value))
    } catch (error) {
        ElMessage.error('Failed to load posts for the selected location.')
    }
}

// Fetch user info to get default location
const setDefaultLocation = async () => {
    // Check if location is stored in localStorage
    const storedLocation = localStorage.getItem('location')
    const storedPosts = localStorage.getItem('posts')

    if (storedLocation && storedLocation !== 'undefined' && storedLocation !== '') {
        location.value = storedLocation
        posts.value = storedPosts ? JSON.parse(storedPosts) : []
    } else {
        try {
            const userInfo = userInfoStore.info
            location.value = userInfo.location // Assuming location is a property of user info
            await fetchPostsByLocation()
        } catch (error) {
            ElMessage.error('Unable to retrieve your location from user info.')
        }
    }
}

// Fetch all posts initially or after setting default location
onMounted(setDefaultLocation)

// Event handler for viewing post details
const viewPostDetails = (postId) => {
    router.push(`/post/${postId}`)
}
</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>Location: {{ location }}</span>
                <el-input
                    v-model="location"
                    placeholder="Enter location"
                    @keyup.enter="fetchPostsByLocation"
                    class="location-input"
                />
                <el-button type="primary" @click="fetchPostsByLocation">Search</el-button>
            </div>
        </template>

        <!-- Post Grid -->
        <div class="post-grid">
            <div
                v-for="post in posts"
                :key="post.id"
                class="post-card"
                @click="viewPostDetails(post.id)"
            >
                <el-card shadow="hover">
                    <img :src="post.coverImg" alt="Post Image" class="post-image" />
                    <div class="post-title">{{ post.title }}</div>
                </el-card>
            </div>
        </div>
    </el-card>
</template>

<style scoped lang="scss">
.page-container {
    min-height: 100%;
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
        grid-auto-rows: auto;
        gap: 16px;
        margin-top: 20px;
        overflow-y: scroll;
        height: calc(100vh - 150px);
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
}
</style>
