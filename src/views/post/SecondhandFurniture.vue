<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { furnitureListService } from '@/api/furniture.js' // Assuming a separate service for Furniture
import { useRouter } from 'vue-router'

// Data model for furniture posts
const furnitureItems = ref([])
const location = ref('')

// Router for navigation
const router = useRouter()

// Fetch furniture posts by location
const fetchFurniturePosts = async () => {
    try {
        const result = await furnitureListService({ location: location.value })
        furnitureItems.value = result.data.items // Assuming API returns data in 'items'
    } catch (error) {
        ElMessage.error('Failed to load furniture posts.')
    }
}

// Fetch furniture on mount
onMounted(fetchFurniturePosts)

// Navigate to furniture details
const viewFurnitureDetails = (furnitureId) => {
    router.push(`/furniture/${furnitureId}`)
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
                    @keyup.enter="fetchFurniturePosts"
                    class="location-input"
                />
                <el-button type="primary" @click="fetchFurniturePosts">Search</el-button>
            </div>
        </template>

        <!-- Furniture Post Grid -->
        <div class="post-grid">
            <el-card
                v-for="furniture in furnitureItems"
                :key="furniture.id"
                class="post-card"
                @click="viewFurnitureDetails(furniture.id)"
            >
                <img :src="furniture.coverImg" alt="Furniture Image" class="post-image" />
                <div class="post-title">{{ furniture.title }}</div>
                <div class="post-price">Price: ${{ furniture.price }}</div>
                <div class="post-condition">Condition: {{ furniture.condition }}</div>
            </el-card>
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
    }
    .post-card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
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
        .post-price, .post-condition {
            font-size: 13px;
            color: #555;
            margin-top: 4px;
        }
    }
}
</style>
