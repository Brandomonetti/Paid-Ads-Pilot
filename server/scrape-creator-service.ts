import axios from 'axios';

const SCRAPE_CREATOR_API_KEY = process.env.SCRAPE_CREATOR_API_KEY;
const SCRAPE_CREATOR_BASE_URL = 'https://api.scrapecreators.com/v1';

export interface SocialMediaConcept {
  platform: 'facebook' | 'instagram' | 'tiktok';
  title: string;
  description: string;
  hook: string;
  visualStyle: string;
  cta: string;
  engagementScore?: number;
  thumbnailUrl?: string;
  postUrl?: string;
  rawData?: any;
}

export interface ScrapedConceptsResponse {
  facebook: SocialMediaConcept[];
  instagram: SocialMediaConcept[];
  tiktok: SocialMediaConcept[];
}

/**
 * Scrape Creator Service
 * Fetches trending ad concepts from social media platforms
 */
export class ScrapeCreatorService {
  private apiKey: string;
  
  constructor() {
    if (!SCRAPE_CREATOR_API_KEY) {
      throw new Error('SCRAPE_CREATOR_API_KEY is not configured');
    }
    this.apiKey = SCRAPE_CREATOR_API_KEY;
  }

  /**
   * Extract key search terms from keywords (2-4 most important words)
   */
  private extractKeyTerms(keywords: string[]): string[] {
    // Extract key nouns/adjectives from each keyword phrase
    const allWords = keywords.join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && // Filter out short words like "and", "the", "for"
        !['from', 'with', 'that', 'this', 'their', 'about', 'into', 'when', 'where'].includes(word)
      );
    
    // Take unique words and limit to 4 most relevant
    const uniqueWords = Array.from(new Set(allWords));
    return uniqueWords.slice(0, 4);
  }

  /**
   * Fetch concepts from all platforms based on brand/niche keywords
   */
  async fetchConceptsForBrand(keywords: string[], niche: string): Promise<ScrapedConceptsResponse> {
    try {
      const [facebookConcepts, instagramConcepts, tiktokConcepts] = await Promise.all([
        this.fetchFacebookConcepts(keywords, niche),
        this.fetchInstagramConcepts(keywords, niche),
        this.fetchTikTokConcepts(keywords, niche)
      ]);

      return {
        facebook: facebookConcepts,
        instagram: instagramConcepts,
        tiktok: tiktokConcepts
      };
    } catch (error) {
      console.error('Error fetching concepts from Scrape Creator:', error);
      throw new Error(`Failed to fetch social media concepts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch Facebook ad concepts
   */
  private async fetchFacebookConcepts(keywords: string[], niche: string): Promise<SocialMediaConcept[]> {
    try {
      // Use simplified search terms for better results
      const searchTerms = this.extractKeyTerms(keywords);
      const query = searchTerms.join(' ');
      
      console.log(`[Facebook API] Original keywords:`, keywords);
      console.log(`[Facebook API] Simplified query: "${query}"`);
      
      const response = await axios.get(
        `${SCRAPE_CREATOR_BASE_URL}/facebook/adLibrary/search/ads`,
        {
          params: {
            query
          },
          headers: {
            'x-api-key': this.apiKey
          }
        }
      );

      console.log('[Facebook API] Response type:', typeof response.data);
      console.log('[Facebook API] Is HTML?', typeof response.data === 'string' && response.data.includes('<html'));
      console.log('[Facebook API] Response keys:', Object.keys(response.data || {}));
      
      return this.parseFacebookResponse(response.data);
    } catch (error) {
      console.error('Error fetching Facebook concepts:', error);
      if (axios.isAxiosError(error)) {
        console.error('[Facebook API] Status:', error.response?.status);
        console.error('[Facebook API] Response:', error.response?.data);
      }
      return [];
    }
  }

  /**
   * Fetch Instagram ad concepts
   */
  private async fetchInstagramConcepts(keywords: string[], niche: string): Promise<SocialMediaConcept[]> {
    try {
      // Use simplified search terms for better results
      const searchTerms = this.extractKeyTerms(keywords);
      const query = searchTerms.join(' ');
      
      console.log(`[Instagram API] Original keywords:`, keywords);
      console.log(`[Instagram API] Simplified query: "${query}"`);
      
      const response = await axios.get(
        `${SCRAPE_CREATOR_BASE_URL}/instagram/reels/search`,
        {
          params: {
            query
          },
          headers: {
            'x-api-key': this.apiKey
          }
        }
      );

      console.log('[Instagram API] Response type:', typeof response.data);
      console.log('[Instagram API] Is HTML?', typeof response.data === 'string' && response.data.includes('<html'));
      console.log('[Instagram API] Response keys:', Object.keys(response.data || {}));
      
      return this.parseInstagramResponse(response.data);
    } catch (error) {
      console.error('Error fetching Instagram concepts:', error);
      if (axios.isAxiosError(error)) {
        console.error('[Instagram API] Status:', error.response?.status);
        console.error('[Instagram API] Response:', error.response?.data);
      }
      return [];
    }
  }

  /**
   * Fetch TikTok ad concepts
   */
  private async fetchTikTokConcepts(keywords: string[], niche: string): Promise<SocialMediaConcept[]> {
    try {
      const query = keywords.join(' ');
      const response = await axios.get(
        `${SCRAPE_CREATOR_BASE_URL}/tiktok/search/top`,
        {
          params: {
            query,
            publish_time: 'last-3-months',
            sort_by: 'most-liked'
          },
          headers: {
            'x-api-key': this.apiKey
          }
        }
      );

      console.log('[TikTok API] Response type:', typeof response.data);
      console.log('[TikTok API] Is HTML?', typeof response.data === 'string' && response.data.includes('<html'));
      console.log('[TikTok API] Response keys:', Object.keys(response.data || {}));
      console.log('[TikTok API] First 500 chars:', JSON.stringify(response.data).substring(0, 500));
      
      return this.parseTikTokResponse(response.data);
    } catch (error) {
      console.error('Error fetching TikTok concepts:', error);
      if (axios.isAxiosError(error)) {
        console.error('[TikTok API] Status:', error.response?.status);
        console.error('[TikTok API] Response:', error.response?.data);
      }
      return [];
    }
  }

  /**
   * Parse Facebook API response into SocialMediaConcept format
   */
  private parseFacebookResponse(data: any): SocialMediaConcept[] {
    console.log('[Facebook Parser] Raw data keys:', Object.keys(data || {}));
    
    // Try multiple possible response structures
    let ads = data?.searchResults || data?.ads || data?.data || [];
    
    if (Array.isArray(data)) {
      ads = data;
    }
    
    if (!Array.isArray(ads)) {
      console.log('[Facebook Parser] Ads is not an array, type:', typeof ads);
      return [];
    }
    
    console.log('[Facebook Parser] Found', ads.length, 'ads');
    
    return ads.slice(0, 20).map((ad: any) => ({
      platform: 'facebook' as const,
      title: ad.page_name || ad.headline || ad.title || 'Facebook Ad Concept',
      description: ad.ad_creative_bodies?.[0] || ad.body || ad.description || '',
      hook: this.extractHook(ad.ad_creative_bodies?.[0] || ad.body || ''),
      visualStyle: 'video',
      cta: ad.ad_creative_link_captions?.[0] || ad.cta || 'Learn More',
      engagementScore: 75,
      thumbnailUrl: ad.snapshot_url || ad.thumbnail_url,
      postUrl: ad.ad_archive_id ? `https://www.facebook.com/ads/library/?id=${ad.ad_archive_id}` : ad.link,
      rawData: ad
    }));
  }

  /**
   * Parse Instagram API response into SocialMediaConcept format
   */
  private parseInstagramResponse(data: any): SocialMediaConcept[] {
    console.log('[Instagram Parser] Raw data keys:', Object.keys(data || {}));
    
    // Try multiple possible response structures
    let reels = data?.reels || data?.data || data?.items || [];
    
    if (Array.isArray(data)) {
      reels = data;
    }
    
    if (!Array.isArray(reels)) {
      console.log('[Instagram Parser] Reels is not an array, type:', typeof reels);
      return [];
    }
    
    console.log('[Instagram Parser] Found', reels.length, 'reels');
    
    return reels.slice(0, 20).map((reel: any) => ({
      platform: 'instagram' as const,
      title: reel.caption?.split('\n')[0]?.substring(0, 60) || 'Instagram Reel Concept',
      description: reel.caption || '',
      hook: this.extractHook(reel.caption || ''),
      visualStyle: 'reel',
      cta: this.extractCTA(reel.caption || ''),
      engagementScore: this.calculateInstagramEngagement(reel),
      thumbnailUrl: reel.thumbnail_src || reel.display_url,
      postUrl: reel.url,
      rawData: reel
    }));
  }

  /**
   * Parse TikTok API response into SocialMediaConcept format
   */
  private parseTikTokResponse(data: any): SocialMediaConcept[] {
    console.log('[TikTok Parser] Raw data keys:', Object.keys(data || {}));
    console.log('[TikTok Parser] Data structure:', JSON.stringify(data).substring(0, 500));
    
    // Try multiple possible response structures - API returns data in 'items' field
    let videos = data?.items || data?.videos || data?.data || data?.aweme_list || [];
    
    // If data is an array itself
    if (Array.isArray(data)) {
      videos = data;
    }
    
    if (!Array.isArray(videos)) {
      console.log('[TikTok Parser] Videos is not an array, type:', typeof videos);
      return [];
    }
    
    console.log('[TikTok Parser] Found', videos.length, 'videos');
    
    return videos.slice(0, 20).map((video: any) => {
      const desc = video.desc || video.description || video.video_description || '';
      const title = desc.substring(0, 60) || 'TikTok Video Concept';
      
      return {
        platform: 'tiktok' as const,
        title,
        description: desc,
        hook: this.extractHook(desc),
        visualStyle: 'short-form video',
        cta: this.extractCTA(desc),
        engagementScore: this.calculateTikTokEngagement(video),
        thumbnailUrl: video.video?.cover?.url_list?.[0] || video.cover?.url_list?.[0] || video.thumbnail_url || video.cover_url,
        postUrl: video.url || (video.author?.unique_id && video.aweme_id ? `https://www.tiktok.com/@${video.author.unique_id}/video/${video.aweme_id}` : ''),
        rawData: video
      };
    });
  }

  /**
   * Extract the hook (first sentence or attention-grabbing phrase)
   */
  private extractHook(text: string): string {
    if (!text) return '';
    
    const firstSentence = text.split(/[.!?\n]/)[0];
    return firstSentence.substring(0, 100).trim();
  }

  /**
   * Extract CTA from text (looking for common patterns)
   */
  private extractCTA(text: string): string {
    const ctaPatterns = [
      /link in bio/i,
      /shop now/i,
      /learn more/i,
      /get yours/i,
      /click link/i,
      /order now/i,
      /buy now/i,
      /sign up/i
    ];

    for (const pattern of ctaPatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }

    return 'Learn More';
  }

  /**
   * Calculate engagement score based on likes, comments, shares
   */
  private calculateEngagementScore(item: any): number {
    const likes = item.likes || item.like_count || 0;
    const comments = item.comments || item.comment_count || 0;
    const shares = item.shares || item.share_count || 0;
    const views = item.views || item.view_count || 1;

    const engagementRate = ((likes + comments * 2 + shares * 3) / views) * 100;
    return Math.min(Math.round(engagementRate * 10) / 10, 100);
  }

  /**
   * Calculate TikTok-specific engagement score
   */
  private calculateTikTokEngagement(video: any): number {
    const stats = video.statistics || {};
    const likes = stats.digg_count || 0;
    const comments = stats.comment_count || 0;
    const shares = stats.share_count || 0;
    const views = stats.play_count || 1;

    const engagementRate = ((likes + comments * 2 + shares * 3) / views) * 100;
    return Math.min(Math.round(engagementRate * 10) / 10, 100);
  }

  /**
   * Calculate Instagram-specific engagement score
   */
  private calculateInstagramEngagement(reel: any): number {
    const likes = reel.like_count || 0;
    const comments = reel.comment_count || 0;
    const views = reel.video_view_count || reel.video_play_count || 1;

    const engagementRate = ((likes + comments * 2) / views) * 100;
    return Math.min(Math.round(engagementRate * 10) / 10, 100);
  }
}

export const scrapeCreatorService = new ScrapeCreatorService();
