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
      const query = keywords.join(' ');
      const response = await axios.get(
        `${SCRAPE_CREATOR_BASE_URL}/facebook/adLibrary/search/ads`,
        {
          params: {
            query,
            status: 'ACTIVE',
            media_type: 'VIDEO'
          },
          headers: {
            'x-api-key': this.apiKey
          }
        }
      );

      console.log('Facebook API Response:', JSON.stringify(response.data, null, 2));
      return this.parseFacebookResponse(response.data);
    } catch (error) {
      console.error('Error fetching Facebook concepts:', error);
      return [];
    }
  }

  /**
   * Fetch Instagram ad concepts
   */
  private async fetchInstagramConcepts(keywords: string[], niche: string): Promise<SocialMediaConcept[]> {
    try {
      const query = keywords.join(' ');
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

      console.log('Instagram API Response:', JSON.stringify(response.data, null, 2));
      return this.parseInstagramResponse(response.data);
    } catch (error) {
      console.error('Error fetching Instagram concepts:', error);
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

      console.log('TikTok API Response:', JSON.stringify(response.data, null, 2));
      return this.parseTikTokResponse(response.data);
    } catch (error) {
      console.error('Error fetching TikTok concepts:', error);
      return [];
    }
  }

  /**
   * Parse Facebook API response into SocialMediaConcept format
   */
  private parseFacebookResponse(data: any): SocialMediaConcept[] {
    if (!data?.ads || !Array.isArray(data.ads)) return [];
    
    return data.ads.map((ad: any) => ({
      platform: 'facebook' as const,
      title: ad.headline || ad.title || 'Facebook Ad Concept',
      description: ad.description || ad.body || '',
      hook: this.extractHook(ad.body || ad.description || ''),
      visualStyle: ad.creative_type || 'video',
      cta: ad.call_to_action?.value || ad.cta || 'Learn More',
      engagementScore: this.calculateEngagementScore(ad),
      thumbnailUrl: ad.thumbnail_url || ad.image_url,
      postUrl: ad.ad_url || ad.link,
      rawData: ad
    }));
  }

  /**
   * Parse Instagram API response into SocialMediaConcept format
   */
  private parseInstagramResponse(data: any): SocialMediaConcept[] {
    if (!data?.posts || !Array.isArray(data.posts)) return [];
    
    return data.posts.map((post: any) => ({
      platform: 'instagram' as const,
      title: post.caption?.split('\n')[0] || 'Instagram Post Concept',
      description: post.caption || '',
      hook: this.extractHook(post.caption || ''),
      visualStyle: post.media_type || 'image',
      cta: this.extractCTA(post.caption || ''),
      engagementScore: this.calculateEngagementScore(post),
      thumbnailUrl: post.thumbnail_url || post.media_url,
      postUrl: post.permalink,
      rawData: post
    }));
  }

  /**
   * Parse TikTok API response into SocialMediaConcept format
   */
  private parseTikTokResponse(data: any): SocialMediaConcept[] {
    if (!data?.videos || !Array.isArray(data.videos)) return [];
    
    return data.videos.map((video: any) => ({
      platform: 'tiktok' as const,
      title: video.description?.substring(0, 50) || 'TikTok Video Concept',
      description: video.description || '',
      hook: this.extractHook(video.description || ''),
      visualStyle: 'short-form video',
      cta: this.extractCTA(video.description || ''),
      engagementScore: this.calculateEngagementScore(video),
      thumbnailUrl: video.cover_url || video.thumbnail_url,
      postUrl: video.share_url || video.video_url,
      rawData: video
    }));
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
}

export const scrapeCreatorService = new ScrapeCreatorService();
