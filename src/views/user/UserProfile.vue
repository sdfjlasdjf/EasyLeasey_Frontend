<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    userInfoService,
    userInfoUpdateService,
    userChangePasswordService
} from '@/api/user'
import {
    userPostsService,
    userLikedPostsService,
    postDetailService,
    postUpdateService // Import the service to update posts
} from '@/api/post'
import { useRouter } from 'vue-router'
import { Edit, Male, Female } from '@element-plus/icons-vue'
import {getOrCreateConversation} from '@/api/chat'
const userInfo = ref({})
const userPosts = ref([])
const likedPosts = ref([])

// Flags for controlling UI
const showEditDialog = ref(false)
const showPostDetailDialog = ref(false)
const showPostEditDialog = ref(false)

// Form data for editing user info
const editForm = ref({})

// Selected post details
const selectedPost = ref(null)
const postEditForm = ref({})

// Router
const router = useRouter()

// Load user information on mount
const loadUserInfo = async () => {
    try {
        const result = await userInfoService()
        userInfo.value = result.data
    } catch (error) {
        ElMessage.error('Failed to load user information.')
    }
}
const chatWithOwner = async (ownerId) => {
    console.log("ownerId:",ownerId)
  try {
    if (ownerId === userInfo.value.id) {
      ElMessage.warning('You cannot chat with yourself.');
      return;
    }
    // Call API to get or create a conversation
    const result = await getOrCreateConversation(ownerId);
    console.log('I got here:', result.data)
    const conversationId = result.data;
    // Redirect to the chat room
    router.push(`/chatroom/${conversationId}`);
  } catch (error) {
    ElMessage.error('Failed to start chat.');
  }
};
// Load posts created by the user
const loadUserPosts = async () => {
    try {
        const result = await userPostsService()
        userPosts.value = result.data
    } catch (error) {
        ElMessage.error('Failed to load user posts.')
    }
}

// Load liked posts
const loadLikedPosts = async () => {
    try {
        const result = await userLikedPostsService()
        likedPosts.value = result.data
    } catch (error) {
        ElMessage.error('Failed to load liked posts.')
    }
}

// Open edit dialog for user info
const openEditDialog = () => {
    editForm.value = { ...userInfo.value } // Copy current user info
    showEditDialog.value = true
}

// Save updated user info
const saveUserInfo = async () => {
    try {
        await userInfoUpdateService(editForm.value)
        ElMessage.success('User information updated successfully')
        userInfo.value = { ...editForm.value } // Update local user info
        showEditDialog.value = false
    } catch (error) {
        ElMessage.error('Failed to update user information.')
    }
}

// Open post detail dialog
const openPostDetailDialog = async (postId) => {
    try {
        const result = await postDetailService(postId)
        selectedPost.value = result.data
        showPostDetailDialog.value = true
    } catch (error) {
        ElMessage.error('Failed to load post details.')
    }
}

// Open post edit dialog
const openPostEditDialog = () => {
    postEditForm.value = { ...selectedPost.value } // Copy post details
    showPostEditDialog.value = true
    showPostDetailDialog.value = false // Close the detail dialog
}

// Save updated post
const savePost = async () => {
    try {
        const postData = {
            ...postEditForm.value,
            postId: postEditForm.value.id, // Include postId in postData
        }
        await postUpdateService(postData)
        ElMessage.success('Post updated successfully')
        // Update the post in userPosts array
        const index = userPosts.value.findIndex(post => post.id === postEditForm.value.id)
        if (index !== -1) {
            userPosts.value[index] = { ...postEditForm.value }
        }
        showPostEditDialog.value = false
        // Refresh the selected post details
        selectedPost.value = { ...postEditForm.value }
        showPostDetailDialog.value = true // Reopen the detail dialog
    } catch (error) {
        ElMessage.error('Failed to update post.')
    }
}


// Load all user-related data on mount
onMounted(() => {
    loadUserInfo()
    loadUserPosts()
    loadLikedPosts()
})

// Helpers to filter posts by category
const postsPlaces = computed(() => userPosts.value.filter(post => post.category === 'places'))
const postsRoommates = computed(() => userPosts.value.filter(post => post.category === 'roommates'))
const postsFurniture = computed(() => userPosts.value.filter(post => post.category === 'furniture'))

const likedPostsPlaces = computed(() => likedPosts.value.filter(post => post.category === 'places'))
const likedPostsRoommates = computed(() => likedPosts.value.filter(post => post.category === 'roommates'))
const likedPostsFurniture = computed(() => likedPosts.value.filter(post => post.category === 'furniture'))
</script>

<template>
    <el-card class="profile-page">
        <!-- User Info Section -->
        <div class="user-info">
            <el-avatar :src="userInfo.avatarUrl || 'default-avatar.png'" size="large"></el-avatar>
            <div class="user-details">
                <div class="username">
                    {{ userInfo.username }}
                    <el-icon :size="20">
                        <component :is="userInfo.sex === 'male' ? Male : Female" />
                    </el-icon>
                    <el-icon @click="openEditDialog" class="edit-icon">
                        <Edit />
                    </el-icon>
                </div>
                <div class="user-meta">
                    <span>Age: {{ userInfo.age }}</span>
                    <span>Location: {{ userInfo.location }}</span>
                </div>
            </div>
        </div>

        <!-- Edit Profile Dialog -->
        <el-dialog title="Edit Profile" v-model="showEditDialog" width="400px">
            <el-form :model="editForm" label-width="120px">
                <el-form-item label="Avatar URL">
                    <el-input v-model="editForm.avatarUrl" placeholder="Enter avatar URL"></el-input>
                </el-form-item>
                <el-form-item label="Real Name">
                    <el-input v-model="editForm.realName"></el-input>
                </el-form-item>
                <el-form-item label="Phone Number">
                    <el-input v-model="editForm.phone"></el-input>
                </el-form-item>
                <el-form-item label="ID Number">
                    <el-input v-model="editForm.id_number"></el-input>
                </el-form-item>
                <el-form-item label="Sex">
                    <el-radio-group v-model="editForm.sex">
                        <el-radio label="male">Male</el-radio>
                        <el-radio label="female">Female</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="Location">
                    <el-input v-model="editForm.location"></el-input>
                </el-form-item>
                <el-form-item label="Age">
                    <el-input v-model="editForm.age"></el-input>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="showEditDialog = false">Cancel</el-button>
                <el-button type="primary" @click="saveUserInfo">Save</el-button>
            </template>
        </el-dialog>

        <!-- Posts and Likes Sections -->
        <el-tabs>
            <el-tab-pane label="Posts">
                <div class="posts-section">
                    <h3>Places</h3>
                    <div class="post-grid">
                        <el-card
                            v-for="post in postsPlaces"
                            :key="post.id"
                            class="post-card"
                            @click="openPostDetailDialog(post.id)"
                        >
                            <img :src="post.coverImg" alt="Post Image" class="post-image" />
                            <div class="post-title">{{ post.title }}</div>
                        </el-card>
                    </div>
                    <h3>Roommates</h3>
                    <div class="post-grid">
                        <el-card
                            v-for="post in postsRoommates"
                            :key="post.id"
                            class="post-card"
                            @click="openPostDetailDialog(post.id)"
                        >
                            <img :src="post.coverImg" alt="Post Image" class="post-image" />
                            <div class="post-title">{{ post.title }}</div>
                        </el-card>
                    </div>
                    <h3>Furniture</h3>
                    <div class="post-grid">
                        <el-card
                            v-for="post in postsFurniture"
                            :key="post.id"
                            class="post-card"
                            @click="openPostDetailDialog(post.id)"
                        >
                            <img :src="post.coverImg" alt="Post Image" class="post-image" />
                            <div class="post-title">{{ post.title }}</div>
                        </el-card>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="Likes">
                <div class="posts-section">
                    <h3>Places</h3>
                    <div class="post-grid">
                        <el-card
                            v-for="post in likedPostsPlaces"
                            :key="post.id"
                            class="post-card"
                            @click="openPostDetailDialog(post.id)"
                        >
                            <img :src="post.coverImg" alt="Liked Post Image" class="post-image" />
                            <div class="post-title">{{ post.title }}</div>

                        </el-card>
                    </div>
                    <h3>Roommates</h3>
                    <div class="post-grid">
                        <el-card
                            v-for="post in likedPostsRoommates"
                            :key="post.id"
                            class="post-card"
                            @click="openPostDetailDialog(post.id)"
                        >   
                            <img :src="post.coverImg" alt="Liked Post Image" class="post-image" />
                            <div class="post-title">{{ post.title }}</div>

                        </el-card>
                    </div>
                    <h3>Furniture</h3>
                    <div class="post-grid">
                        <el-card
                            v-for="post in likedPostsFurniture"
                            :key="post.id"
                            class="post-card"
                            @click="openPostDetailDialog(post.id)"
                        >
                            <img :src="post.coverImg" alt="Liked Post Image" class="post-image" />
                            <div class="post-title">{{ post.title }}</div>

                        </el-card>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>

        <!-- Post Detail Dialog -->
        <el-dialog title="Post Details" v-model="showPostDetailDialog" width="40%">
            <div v-if="selectedPost">
                <img :src="selectedPost.coverImg" alt="Post Image" class="detail-image" />
                <div class="detail-title">{{ selectedPost.title }}</div>
                <div class="detail-content">{{ selectedPost.content }}</div>
                <div class="detail-location">Location: {{ selectedPost.location }}</div>
                <div v-if="selectedPost.price" class="detail-price">Price: ${{ selectedPost.price }}</div>
            </div>
            <template #footer>
                <el-button @click="chatWithOwner(selectedPost.userId)">Chat</el-button>
                <el-button type="primary" @click="openPostEditDialog">Edit</el-button>
                <el-button @click="showPostDetailDialog = false">Close</el-button>
            </template>
        </el-dialog>

        <!-- Post Edit Dialog -->
        <el-dialog title="Edit Post" v-model="showPostEditDialog" width="40%">
            <el-form :model="postEditForm" label-width="120px">
                <el-form-item label="Title">
                    <el-input v-model="postEditForm.title"></el-input>
                </el-form-item>
                <el-form-item label="Content">
                    <el-input type="textarea" v-model="postEditForm.content"></el-input>
                </el-form-item>
                <el-form-item label="Image URL">
                    <el-input v-model="postEditForm.coverImg"></el-input>
                </el-form-item>
                <el-form-item label="Location">
                    <el-input v-model="postEditForm.location"></el-input>
                </el-form-item>
                <el-form-item label="Price">
                    <el-input v-model="postEditForm.price"></el-input>
                </el-form-item>
                <!-- Add other fields as necessary -->
            </el-form>
            <template #footer>
                <el-button @click="showPostEditDialog = false">Cancel</el-button>
                <el-button type="primary" @click="savePost">Save</el-button>
            </template>
        </el-dialog>
    </el-card>
</template>

<style scoped lang="scss">
.profile-page {
    .user-info {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        .el-avatar {
            margin-right: 20px;
        }
        .user-details {
            .username {
                display: flex;
                align-items: center;
                font-size: 20px;
                font-weight: bold;
                .el-icon {
                    margin-left: 8px;
                    cursor: pointer;
                }
                .edit-icon {
                    margin-left: 16px;
                    cursor: pointer;
                }
            }
            .user-meta {
                margin-top: 8px;
                span {
                    margin-right: 16px;
                    color: #666;
                }
            }
        }
    }
    .posts-section {
        margin-top: 20px;
        h3 {
            margin-top: 20px;
            font-size: 18px;
            font-weight: bold;
        }
        .post-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
            margin-top: 10px;
        }
        .post-card {
            cursor: pointer;
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
    }
    .detail-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    .detail-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
    }
    .detail-content {
        font-size: 16px;
        margin-bottom: 10px;
    }
    .detail-location,
    .detail-price {
        font-size: 16px;
        color: #666;
        margin-bottom: 5px;
    }
}
</style>
