export const getPostUrl = (post: any) => {
    const type = post.post_type === 'news' ? 'news' : 'blog';
    return `/${type}/${post.slug}`;
};
