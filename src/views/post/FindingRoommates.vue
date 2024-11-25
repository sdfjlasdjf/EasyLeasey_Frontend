<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { postListService } from '@/api/post.js'
import { useRouter } from 'vue-router'
import useUserInfoStore from '@/stores/userInfo.js'

const userInfoStore = useUserInfoStore()

// Data model for posts and location
const posts = ref([])
const location = ref('')

// Router for navigation
const router = useRouter()

// Fetch roommate posts by location
const fetchRoommatePosts = async () => {
    try {
        const result = await postListService({ location: location.value, category: 'roommates' })
        posts.value = result.data
        localStorage.setItem('location_roommates', location.value)
        localStorage.setItem('posts_roommates', JSON.stringify(posts.value))
    } catch (error) {
        ElMessage.error('Failed to load roommate posts.')
    }
}

// Fetch user info to get default location
const setDefaultLocation = async () => {
    // Check if location and posts are stored in localStorage for roommates
    const storedLocation = localStorage.getItem('location_roommates')
    const storedPosts = localStorage.getItem('posts_roommates')
    if (storedLocation && storedPosts !== 'undefined' && storedLocation !== '') {
        location.value = storedLocation
        posts.value = storedPosts ? JSON.parse(storedPosts) : [] // Parse only if storedPosts is valid
    } else {
        try {
            const userInfo = userInfoStore.info
            console.log("userInfo is here", userInfo)
            location.value = userInfo.location // Assuming location is a property of user info
            await fetchRoommatePosts()
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
                    @keyup.enter="fetchRoommatePosts"
                    class="location-input"
                />
                <el-button type="primary" @click="fetchRoommatePosts">Search</el-button>
            </div>
        </template>

        <!-- Roommate Post Grid -->
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
        gap: 16px;
        margin-top: 20px;
        overflow-y: scroll;
        height: calc(100vh - 150px); /* Adjust for header and footer */
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
