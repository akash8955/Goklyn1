/**
 * Mock news data for development and testing
 * Remove or replace with actual API calls in production
 */

// Sample authors for mock data
const mockAuthors = [
  { _id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'editor' },
  { _id: '3', name: 'John Doe', email: 'john@example.com', role: 'author' },
  { _id: '4', name: 'Alice Johnson', email: 'alice@example.com', role: 'author' },
];

// Sample tags for mock data
const mockTags = [
  'technology', 'business', 'science', 'health', 'entertainment',
  'sports', 'politics', 'education', 'lifestyle', 'travel'
];

// Sample categories
export const mockCategories = [
  { _id: '1', name: 'Technology', slug: 'technology', description: 'Latest in tech and innovation' },
  { _id: '2', name: 'Business', slug: 'business', description: 'Business news and updates' },
  { _id: '3', name: 'Science', slug: 'science', description: 'Scientific discoveries' },
  { _id: '4', name: 'Health', slug: 'health', description: 'Health and wellness' },
  { _id: '5', name: 'Entertainment', slug: 'entertainment', description: 'Entertainment news' },
  { _id: '6', name: 'Sports', slug: 'sports', description: 'Sports updates' },
  { _id: '7', name: 'Politics', slug: 'politics', description: 'Political news' },
  { _id: '8', name: 'Education', slug: 'education', description: 'Educational content' },
  { _id: '9', name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle and culture' },
  { _id: '10', name: 'Travel', slug: 'travel', description: 'Travel guides and tips' }
];

// Helper function to generate random date within range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate mock news articles
const generateMockNews = () => {
  const articles = [];
  const statuses = ['published', 'draft', 'archived'];
  
  for (let i = 1; i <= 20; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const publishedAt = status === 'published' ? randomDate(new Date(2023, 0, 1), new Date()) : null;
    const createdAt = randomDate(new Date(2022, 6, 1), new Date());
    const updatedAt = randomDate(createdAt, new Date());
    const category = mockCategories[Math.floor(Math.random() * mockCategories.length)];
    const author = mockAuthors[Math.floor(Math.random() * mockAuthors.length)];
    
    // Generate 1-3 random tags
    const articleTags = [];
    const numTags = Math.floor(Math.random() * 3) + 1;
    const availableTags = [...mockTags];
    
    for (let j = 0; j < numTags; j++) {
      if (availableTags.length === 0) break;
      const tagIndex = Math.floor(Math.random() * availableTags.length);
      articleTags.push(availableTags.splice(tagIndex, 1)[0]);
    }
    
    articles.push({
      _id: i.toString(),
      title: `Sample News Article ${i}`,
      slug: `sample-news-article-${i}`,
      excerpt: `This is a sample news article number ${i} with a brief excerpt that describes what the article is about.`,
      content: `<p>This is the full content of sample news article ${i}. It contains detailed information about the topic.</p>`,
      featuredImage: `https://source.unsplash.com/random/800x500/?${articleTags[0] || 'news'},${i}`,
      status,
      category: category._id,
      tags: articleTags,
      author: author._id,
      publishedAt: publishedAt ? publishedAt.toISOString() : null,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50)
    });
  }
  
  return articles;
};

// Generate and export mock news data
export const mockNews = generateMockNews();

// Helper function to get related articles
export const getRelatedArticles = (articleId, limit = 3) => {
  const article = mockNews.find(a => a._id === articleId);
  if (!article) return [];
  
  // Find articles with the same category or tags
  return mockNews
    .filter(a => 
      a._id !== articleId && 
      (a.category === article.category || a.tags.some(tag => article.tags.includes(tag)))
    )
    .slice(0, limit);
};

// Helper function to get popular articles
export const getPopularArticles = (limit = 5) => {
  return [...mockNews]
    .filter(article => article.status === 'published')
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

// Helper function to get recent articles
export const getRecentArticles = (limit = 5) => {
  return [...mockNews]
    .filter(article => article.status === 'published' && article.publishedAt)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit);
};

// Mock API functions
export const mockApi = {
  async getNews(params = {}) {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      tag, 
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = params;
    
    let filtered = [...mockNews];
    
    // Apply filters
    if (status) {
      filtered = filtered.filter(article => article.status === status);
    }
    
    if (category) {
      filtered = filtered.filter(article => article.category === category || 
        (typeof article.category === 'object' && article.category._id === category));
    }
    
    if (tag) {
      filtered = filtered.filter(article => article.tags.includes(tag));
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm) ||
        article.excerpt.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      if (sortBy === 'publishedAt' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);
    
    return {
      data: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  },
  
  async getNewsItem(idOrSlug) {
    const article = mockNews.find(article => 
      article._id === idOrSlug || article.slug === idOrSlug
    );
    
    if (!article) {
      throw new Error('Article not found');
    }
    
    // Simulate view count increment
    article.views = (article.views || 0) + 1;
    
    return article;
  },
  
  async getCategories() {
    return mockCategories;
  },
  
  // Add more mock API functions as needed
};

export default mockApi;
