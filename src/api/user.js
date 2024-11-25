import request from '@/utils/request.js'

// Register user API
export const userRegisterService = (registerData) => {
    const params = new URLSearchParams()
    for (let key in registerData) {
        params.append(key, registerData[key])
    }
    return request.post('/user/register', params)
}

// User login API
export const userLoginService = (loginData) => {
    const params = new URLSearchParams()
    for (let key in loginData) {
        params.append(key, loginData[key])
    }
    return request.post('/user/login', params)
}

// Fetch detailed user information
export const userInfoService = () => {
    return request.get('/user/userInfo')
}

// Update user personal information
export const userInfoUpdateService = (userInfoData) => {
    return request.put('/user/update', userInfoData)
}

// Update user avatar
export const userAvatarUpdateService = (avatarUrl) => {
    const params = new URLSearchParams()
    params.append('avatarUrl', avatarUrl)
    return request.patch('/user/updateAvatar', params)
}

// User likes a post API
export const likePostService = (postId) => {
    return request.post(`/user/like`, { postId })
}

// Fetch posts created by the user
export const userPostsService = () => {
    return request.get('/post/userposts')
}

// Fetch posts liked by the user


// Change user password
export const userChangePasswordService = (passwordData) => {
    return request.put('/user/change-password', passwordData)
}