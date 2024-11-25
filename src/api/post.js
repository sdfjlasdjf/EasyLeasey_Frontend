import request from '@/utils/request.js'
import { useTokenStore } from '@/stores/token.js'

// Post category list query (e.g., categories for apartments, roommates, furniture)
export const postCategoryListService = () => {
    return request.get('/category')
}

// Add a new post category
export const postCategoryAddService = (categoryData) => {
    return request.post('/category', categoryData)
}

// Update an existing post category
export const postCategoryUpdateService = (categoryData) => {
    return request.put('/category', categoryData)
}

// Delete a post category by ID
export const postCategoryDeleteService = (id) => {
    return request.delete(`/category?id=${id}`)
}

export const postDetailService = (id) => {
    return request.get(`/post/postdetail?postId=${id}`)
}
export const userPostsService = () => {
    return request.get(`/post/userposts`)
}
// Query posts (e.g., for finding places, roommates, or furniture)
export const postListService = ({ location, category }) => {
    return request.get('/post/getpostbylocation', { 
        params: {
            location,
            category,
        }
    })
}

export const likePostService = (postId, isLiked) => {
    return request.put(`/likes/togglelike`, null, { 
        params: {
            postId,
            isLiked,
        }
    })
}


export const postIsLikedService = (postId) => {
    return request.get(`/likes/isliked`, { 
        params: {
            postId,
        }
    })
}

export const userLikedPostsService = () => {
    return request.get('/post/liked')
}
// Update an existing post
export const postUpdateService = (postData) => {
    console.log('postdata:',postData)
    return request.put(`/post/update`, postData)
}

// Add a new post
export const postAddService = (postData) => {
    return request.post('/post', postData)
}
