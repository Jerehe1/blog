const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);
};

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return null;

    return blogs.reduce((prev, curr) => {
        return (curr.likes || 0) > (prev.likes || 0) ? curr : prev;
    });
};



module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    
};