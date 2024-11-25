<script setup>
import { ref, computed } from 'vue'
import {
    Document,
    User,
    Crop,
    EditPen,
    SwitchButton,
    CaretBottom
} from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'

import { useTokenStore } from '@/stores/token.js'
import useUserInfoStore from '@/stores/userInfo.js'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userInfoService } from '@/api/user.js'
import { postAddService } from '@/api/post.js' // Updated to use 'postAddService'

const tokenStore = useTokenStore()
const userInfoStore = useUserInfoStore()
const router = useRouter()

// Post form dialog visibility and data model
const postDialogVisible = ref(false)
const postForm = ref({
    category: '', // Default category is empty
    title: '',
    content: '',
    image: '',
    location: '',
    price: '' // Added price field
})

// Category options
const categoryOptions = [
    { label: 'Finding or Renting Out Places', value: 'places' },
    { label: 'Looking for Roommates', value: 'roommates' },
    { label: 'Secondhand Furniture for Sale', value: 'furniture' }
]

// Computed property to determine if price should be shown
const showPriceField = computed(() => {
    return postForm.value.category === 'furniture' || postForm.value.category === 'places' || postForm.value.category === 'roommates'
})

// Open the post dialog
const openPostForm = () => {
    postDialogVisible.value = true
}

// Submit post form
const submitPost = async () => {
    try {
        await postAddService(postForm.value) // Call the API to create a post
        ElMessage.success('Post created successfully!')
        postDialogVisible.value = false // Close the dialog on success
        postForm.value = { category: '', title: '', content: '', image: '', location: '', price: '' } // Reset form
    } catch (error) {
        ElMessage.error('Failed to create post.')
    }
}

// Fetch user information
const getUserInfo = async () => {
    let result = await userInfoService()
    userInfoStore.setInfo(result.data)
}
getUserInfo()

// Handle dropdown menu actions
const handleCommand = (command) => {
    if (command === 'logout') {
        ElMessageBox.confirm(
            'Are you sure you want to log out?',
            'Confirmation',
            {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                type: 'warning',
            }
        )
            .then(async () => {
                tokenStore.removeToken()
                userInfoStore.removeInfo()
                router.push('/login')
                ElMessage({ type: 'success', message: 'Successfully logged out' })
            })
            .catch(() => {
                ElMessage({ type: 'info', message: 'Logout canceled' })
            })
    } else {
        router.push(`/user/${command}`)
    }
}
</script>

<template>
    <!-- Main layout container -->
    <el-container class="layout-container">
        <!-- Left-side menu -->
        <el-aside width="220px" class="aside-menu">
            <div class="aside-menu__logo"></div>
            <el-menu active-text-color="#ffd04b" background-color="#232323" text-color="#fff" router class="menu-list">
                <el-menu-item index="/posts">
                    <el-icon><Document /></el-icon>
                    <span>Posts</span>
                </el-menu-item>
                <el-menu-item index="/chat">
                    <el-icon><Document /></el-icon>
                    <span>Chat</span>
                </el-menu-item>
                <el-menu-item index="/user/profile">
                    <el-icon><User /></el-icon>
                    <span>Personal Profile</span>
                </el-menu-item>
            </el-menu>
            <!-- Post Button and User Info at the bottom -->
            <div class="bottom-section">
                <el-button type="primary" @click="openPostForm" class="post-button">Post</el-button>
                <div class="user-info" @click="handleCommand('profile')">
                    <el-avatar :src="userInfoStore.info.userPic || avatar" size="medium"></el-avatar>
                    <span class="username">{{ userInfoStore.info.nickname }}</span>
                </div>
            </div>
        </el-aside>

        <!-- Right-side main area -->
        <el-container>
            <!-- Main content area for viewing pages based on router navigation -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>

    <!-- Popup form for creating a post -->
    <el-dialog title="Create Post" v-model="postDialogVisible" width="30%">
        <el-form :model="postForm" label-width="150px">
            <el-form-item label="Category" required>
                <el-select v-model="postForm.category" placeholder="Select category">
                    <el-option
                        v-for="option in categoryOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="Title" required>
                <el-input v-model="postForm.title" placeholder="Enter title"></el-input>
            </el-form-item>
            <el-form-item label="Content" required>
                <el-input type="textarea" v-model="postForm.content" placeholder="Enter content"></el-input>
            </el-form-item>
            <el-form-item label="Image">
                <el-input v-model="postForm.image" placeholder="Enter image URL"></el-input>
            </el-form-item>
            <el-form-item label="Location" required>
                <el-input v-model="postForm.location" placeholder="Enter location"></el-input>
            </el-form-item>
            <!-- Conditional Price Field -->
            <el-form-item v-if="showPriceField" label="Price/Rent Price">
                <el-input v-model="postForm.price" placeholder="Enter price or rent price"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="postDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="submitPost">Submit</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style lang="scss" scoped>
.layout-container {
    height: 100vh;

    .aside-menu {
        background-color: #232323;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        &__logo {
            height: 120px;
            background: url('@/assets/logo.png') no-repeat center / 180px auto;
            margin: 20px;
        }

        .menu-list {
            flex-grow: 1;
        }

        .bottom-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-bottom: 20px;

            .post-button {
                background-color: #409eff;
                color: #fff;
                font-weight: bold;
                margin-bottom: 20px;
                width: 160px;
                height: 40px;
                border-radius: 20px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .user-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;

                .el-avatar {
                    margin-bottom: 10px;
                }

                .username {
                    color: #fff;
                    font-size: 16px;
                    font-weight: bold;
                }
            }
        }
    }

    .el-main {
        background-color: #f5f5f5;
        padding: 20px;
        overflow-y: auto;
    }
}
</style>
