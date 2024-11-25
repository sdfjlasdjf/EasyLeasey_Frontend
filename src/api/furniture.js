import request from '@/utils/request.js'

// Fetch list of furniture posts, with optional filters for location, userId, etc.
export const furnitureListService = ({ location, userId } = {}) => {
    return request.get('/furniture', {
        params: {
            location,
            userId
        }
    })
}

// Add a new furniture post
export const furnitureAddService = (furnitureData) => {
    return request.post('/furniture', furnitureData)
}

// Update an existing furniture post
export const furnitureUpdateService = (furnitureId, updatedData) => {
    return request.put(`/furniture/${furnitureId}`, updatedData)
}

// Delete a furniture post by ID
export const furnitureDeleteService = (furnitureId) => {
    return request.delete(`/furniture/${furnitureId}`)
}

// Fetch details of a single furniture post by ID
export const furnitureDetailService = (furnitureId) => {
    return request.get(`/furniture/${furnitureId}`)
}

// Like a furniture post (add it to user's liked posts)
export const furnitureLikeService = (furnitureId) => {
    return request.post(`/furniture/${furnitureId}/like`)
}

// Fetch all furniture posts liked by the current user
export const userLikedFurnitureService = () => {
    return request.get('/user/liked-furniture')
}
