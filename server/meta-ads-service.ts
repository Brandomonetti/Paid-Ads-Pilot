import axios from 'axios';

interface MetaAdAccount {
  id: string;
  name: string;
  currency: string;
  timezone_name: string;
  spend?: number;
}

interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  spend: string;
  impressions: string;
  clicks: string;
  actions?: any[];
  purchases?: string;
  revenue?: string;
}

interface MetaAdSet {
  id: string;
  name: string;
  status: string;
  campaign_id: string;
  targeting: any;
  daily_budget?: string;
  bid_strategy?: string;
  spend: string;
  impressions: string;
  clicks: string;
  actions?: any[];
  purchases?: string;
  revenue?: string;
}

interface MetaAd {
  id: string;
  name: string;
  status: string;
  adset_id: string;
  creative: {
    object_type: string;
    video_id?: string;
    image_hash?: string;
  };
  spend: string;
  impressions: string;
  clicks: string;
  actions?: any[];
  purchases?: string;
  revenue?: string;
  video_avg_percent_watched_actions?: any;
  video_thruplay_watched_actions?: any;
}

export class MetaAdsService {
  private baseUrl = 'https://graph.facebook.com/v19.0';

  constructor() {
    // No longer requires global access token - uses user-specific tokens
  }

  // Set user access token for requests
  setAccessToken(accessToken: string) {
    if (!accessToken) {
      throw new Error('User access token is required');
    }
    return new MetaAdsServiceWithToken(accessToken);
  }
}

class MetaAdsServiceWithToken {
  private baseUrl = 'https://graph.facebook.com/v19.0';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('🔍 Meta API Request:', { url, params: { ...params, access_token: '[REDACTED]' } });
      
      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          ...params
        }
      });
      
      console.log('🔍 Meta API Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('Meta Ads API Error:', error.response?.data || error.message);
      throw new Error(`Meta Ads API request failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getAdAccounts(): Promise<MetaAdAccount[]> {
    const response = await this.makeRequest('/me/adaccounts', {
      fields: 'id,name,currency,timezone_name,spend'
    });
    return response.data || [];
  }

  async getCampaigns(adAccountId: string, dateRange: string = 'last_30_days'): Promise<MetaCampaign[]> {
    const response = await this.makeRequest(`/${adAccountId}/campaigns`, {
      fields: 'id,name,objective,status',
      level: 'campaign',
      time_range: JSON.stringify({ since: this.getDateRange(dateRange).since, until: this.getDateRange(dateRange).until }),
      breakdowns: '',
      limit: '100'
    });

    // Get insights for campaigns
    const campaignIds = response.data.map((c: any) => c.id);
    if (campaignIds.length === 0) return [];

    // Try to get insights data, but handle empty results gracefully
    let insightsData = [];
    try {
      const insightsResponse = await this.makeRequest(`/${adAccountId}/insights`, {
        level: 'campaign',
        fields: 'campaign_id,spend,impressions,clicks,actions,action_values,purchase_roas,cpm,ctr,cpc',
        action_breakdowns: 'action_type',
        time_range: JSON.stringify({ since: this.getDateRange(dateRange).since, until: this.getDateRange(dateRange).until }),
        filtering: JSON.stringify([{
          field: 'campaign.id',
          operator: 'IN',
          value: campaignIds
        }]),
        limit: '100'
      });
      insightsData = insightsResponse.data || [];
    } catch (error) {
      console.log('No insights data available for campaigns in date range');
      insightsData = [];
    }

    // Merge campaign data with insights (or defaults if no insights)
    const campaigns = response.data.map((campaign: any) => {
      const insights = insightsData.find((insight: any) => insight.campaign_id === campaign.id);
      return {
        ...campaign,
        spend: insights?.spend || '0',
        impressions: insights?.impressions || '0',
        clicks: insights?.clicks || '0',
        actions: insights?.actions || [],
        purchases: this.extractPurchases(insights?.actions || []),
        revenue: this.extractPurchaseValue(insights?.action_values || [], insights?.purchase_roas, insights?.spend),
        cpm: insights?.cpm || '0',
        ctr: insights?.ctr || '0',
        cpc: insights?.cpc || '0'
      };
    });

    return campaigns;
  }

  async getAdSets(adAccountId: string, campaignId?: string, dateRange: string = 'last_30_days'): Promise<MetaAdSet[]> {
    const params: any = {
      fields: 'id,name,status,campaign_id,targeting,daily_budget,bid_strategy',
      level: 'adset',
      time_range: JSON.stringify({ since: this.getDateRange(dateRange).since, until: this.getDateRange(dateRange).until }),
      limit: '100'
    };

    if (campaignId) {
      params.filtering = JSON.stringify([{
        field: 'adset.campaign_id',
        operator: 'IN',
        value: [campaignId]
      }]);
    }

    const response = await this.makeRequest(`/${adAccountId}/adsets`, params);

    // Get insights for ad sets
    const adSetIds = response.data.map((a: any) => a.id);
    if (adSetIds.length === 0) return [];

    const insightsResponse = await this.makeRequest(`/${adAccountId}/insights`, {
      level: 'adset',
      fields: 'adset_id,spend,impressions,clicks,actions,action_values,purchase_roas,cpm,ctr,cpc',
      action_breakdowns: 'action_type',
      time_range: JSON.stringify({ since: this.getDateRange(dateRange).since, until: this.getDateRange(dateRange).until }),
      filtering: JSON.stringify([{
        field: 'adset.id',
        operator: 'IN',
        value: adSetIds
      }]),
      limit: '100'
    });

    // Merge ad set data with insights
    const adSets = response.data.map((adSet: any) => {
      const insights = insightsResponse.data.find((insight: any) => insight.adset_id === adSet.id);
      return {
        ...adSet,
        spend: insights?.spend || '0',
        impressions: insights?.impressions || '0',
        clicks: insights?.clicks || '0',
        actions: insights?.actions || [],
        purchases: this.extractPurchases(insights?.actions || []),
        revenue: this.extractPurchaseValue(insights?.action_values || [], insights?.purchase_roas, insights?.spend)
      };
    });

    return adSets;
  }

  async getAds(adAccountId: string, adSetId?: string, dateRange: string = 'last_30_days'): Promise<MetaAd[]> {
    const params: any = {
      fields: 'id,name,status,adset_id,creative{id,thumbnail_url,object_story_spec,object_type,title,body,url_tags,image_url}',
      level: 'ad',
      time_range: JSON.stringify({ since: this.getDateRange(dateRange).since, until: this.getDateRange(dateRange).until }),
      limit: '100'
    };

    if (adSetId) {
      params.filtering = JSON.stringify([{
        field: 'ad.adset_id',
        operator: 'IN',
        value: [adSetId]
      }]);
    }

    const response = await this.makeRequest(`/${adAccountId}/ads`, params);

    // Get insights for ads
    const adIds = response.data.map((a: any) => a.id);
    if (adIds.length === 0) return [];

    const insightsResponse = await this.makeRequest(`/${adAccountId}/insights`, {
      level: 'ad',
      fields: 'ad_id,spend,impressions,clicks,actions,action_values,purchase_roas,video_play_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p100_watched_actions,cpm,ctr,cpc',
      action_breakdowns: 'action_type',
      time_range: JSON.stringify({ since: this.getDateRange(dateRange).since, until: this.getDateRange(dateRange).until }),
      filtering: JSON.stringify([{
        field: 'ad.id',
        operator: 'IN',
        value: adIds
      }]),
      limit: '100'
    });

    // Merge ad data with insights
    const ads = response.data.map((ad: any) => {
      const insights = insightsResponse.data.find((insight: any) => insight.ad_id === ad.id);
      return {
        ...ad,
        spend: insights?.spend || '0',
        impressions: insights?.impressions || '0',
        clicks: insights?.clicks || '0',
        actions: insights?.actions || [],
        purchases: this.extractPurchases(insights?.actions || []),
        revenue: this.extractPurchaseValue(insights?.action_values || [], insights?.purchase_roas, insights?.spend),
        video_play_actions: insights?.video_play_actions,
        video_p25_watched_actions: insights?.video_p25_watched_actions,
        video_p50_watched_actions: insights?.video_p50_watched_actions,
        video_p75_watched_actions: insights?.video_p75_watched_actions,
        video_p100_watched_actions: insights?.video_p100_watched_actions
      };
    });

    return ads;
  }

  async getAccountInsights(adAccountId: string, dateRange: string = 'last_30_days'): Promise<any> {
    const response = await this.makeRequest(`/${adAccountId}/insights`, {
      level: 'account',
      fields: 'spend,impressions,clicks,actions,action_values,purchase_roas,cpm,ctr,cpc',
      action_breakdowns: 'action_type',
      time_range: JSON.stringify({ since: this.getDateRange(dateRange).since, until: this.getDateRange(dateRange).until }),
      limit: '1'
    });

    const insights = response.data[0] || {};
    
    // If no data returned, provide default structure with zeros
    if (!insights || Object.keys(insights).length === 0) {
      return {
        spend: '0',
        impressions: '0',
        clicks: '0',
        actions: [],
        action_values: [],
        purchase_roas: '0',
        cpm: '0',
        ctr: '0',
        cpc: '0',
        purchases: '0'
      };
    }
    
    return {
      ...insights,
      purchases: this.extractPurchases(insights.actions || []),
      revenue: this.extractPurchaseValue(insights.action_values || [], insights.purchase_roas, insights.spend)
    };
  }

  private getDateRange(range: string) {
    const today = new Date();
    const since = new Date();
    
    switch (range) {
      case 'last_7_days':
        since.setDate(today.getDate() - 7);
        break;
      case 'last_14_days':
        since.setDate(today.getDate() - 14);
        break;
      case 'last_30_days':
        since.setDate(today.getDate() - 30);
        break;
      case 'last_90_days':
        since.setDate(today.getDate() - 90);
        break;
      default:
        since.setDate(today.getDate() - 30);
    }

    // Use yesterday as 'until' since Facebook data can have a 1-day delay
    const until = new Date();
    until.setDate(today.getDate() - 1);

    return {
      since: since.toISOString().split('T')[0],
      until: until.toISOString().split('T')[0]
    };
  }

  // Calculate derived metrics
  calculateMetrics(data: any) {
    const spend = parseFloat(data.spend || '0');
    const revenue = parseFloat(data.revenue || '0');
    const impressions = parseInt(data.impressions || '0');
    const clicks = parseInt(data.clicks || '0');
    
    return {
      roas: revenue > 0 && spend > 0 ? (revenue / spend) : 0,
      cpm: impressions > 0 && spend > 0 ? (spend / impressions * 1000) : 0,
      ctr: impressions > 0 && clicks > 0 ? (clicks / impressions * 100) : 0,
      cpc: clicks > 0 && spend > 0 ? (spend / clicks) : 0,
      hookRate: this.calculateHookRate(data),
      thumbstopRate: this.calculateThumbstopRate(data)
    };
  }

  private calculateHookRate(data: any): number {
    // Hook rate = 3-second video views (P25) / impressions
    const videoP25Views = data.video_p25_watched_actions?.[0]?.value || 0;
    const impressions = parseInt(data.impressions || '0');
    return impressions > 0 ? (parseInt(videoP25Views) / impressions * 100) : 0;
  }

  private calculateThumbstopRate(data: any): number {
    // Thumbstop rate = video plays / impressions
    const videoPlays = data.video_play_actions?.[0]?.value || 0;
    const impressions = parseInt(data.impressions || '0');
    return impressions > 0 ? (parseInt(videoPlays) / impressions * 100) : 0;
  }

  // Extract purchase count from actions array
  private extractPurchases(actions: any[]): string {
    if (!actions || !Array.isArray(actions)) return '0';
    
    const purchaseAction = actions.find(action => 
      action.action_type === 'omni_purchase' || 
      action.action_type === 'purchase' ||
      action.action_type === 'offsite_conversion.fb_pixel_purchase' ||
      action.action_type === 'onsite_conversion.purchase'
    );
    
    return purchaseAction?.value || '0';
  }

  // Extract purchase value (revenue) from action_values array
  private extractPurchaseValue(actionValues: any[], fallbackPurchaseRoas?: any, spend?: string): string {
    // Priority order to avoid double-counting the same conversion
    const purchaseActionTypes = [
      'omni_purchase',           // Meta's unified purchase tracking (highest priority)
      'purchase',                // Standard purchase conversion
      'offsite_conversion.fb_pixel_purchase',  // Facebook Pixel purchase
      'onsite_conversion.purchase'  // On-site purchase tracking
    ];
    
    let totalRevenue = 0;
    
    // First try to get revenue from action_values
    if (actionValues && Array.isArray(actionValues) && actionValues.length > 0) {
      // Use the first available purchase action type to avoid double-counting
      for (const actionType of purchaseActionTypes) {
        const action = actionValues.find(a => a.action_type === actionType);
        if (action && action.value) {
          totalRevenue = parseFloat(action.value);
          break; // Stop at first match to avoid double-counting
        }
      }
    }
    
    // If no revenue found in action_values, try fallback to purchase_roas
    if (totalRevenue === 0 && fallbackPurchaseRoas && spend) {
      let roasValue = 0;
      
      if (Array.isArray(fallbackPurchaseRoas)) {
        // purchase_roas as array (when action_breakdowns=action_type)
        // Use same priority order for consistency
        for (const actionType of purchaseActionTypes) {
          const entry = fallbackPurchaseRoas.find((e: any) => e.action_type === actionType);
          if (entry && entry.value) {
            roasValue = parseFloat(entry.value);
            break;
          }
        }
      } else if (typeof fallbackPurchaseRoas === 'string' || typeof fallbackPurchaseRoas === 'number') {
        // purchase_roas as string or number
        roasValue = parseFloat(fallbackPurchaseRoas.toString());
      }
      
      if (roasValue > 0) {
        totalRevenue = parseFloat(spend) * roasValue;
      }
    }
    
    return totalRevenue.toString();
  }
}

export const metaAdsService = new MetaAdsService();

// For backward compatibility with existing code
export { MetaAdsServiceWithToken };