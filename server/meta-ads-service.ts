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
  purchases?: string;
  revenue?: string;
  video_avg_percent_watched_actions?: any;
  video_thruplay_watched_actions?: any;
}

export class MetaAdsService {
  private baseUrl = 'https://graph.facebook.com/v19.0';
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN || '';
    if (!this.accessToken) {
      throw new Error('META_ACCESS_TOKEN environment variable is required');
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          ...params
        }
      });
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

    const insightsResponse = await this.makeRequest(`/${adAccountId}/insights`, {
      level: 'campaign',
      fields: 'campaign_id,spend,impressions,clicks,purchases,purchase_roas',
      time_range: JSON.stringify({ since: this.getDateRange(dateRange).since, until: this.getDateRange(dateRange).until }),
      filtering: JSON.stringify([{
        field: 'campaign.id',
        operator: 'IN',
        value: campaignIds
      }]),
      limit: '100'
    });

    // Merge campaign data with insights
    const campaigns = response.data.map((campaign: any) => {
      const insights = insightsResponse.data.find((insight: any) => insight.campaign_id === campaign.id);
      return {
        ...campaign,
        spend: insights?.spend || '0',
        impressions: insights?.impressions || '0',
        clicks: insights?.clicks || '0',
        purchases: insights?.purchases || '0',
        revenue: insights?.purchase_roas ? (parseFloat(insights?.spend || '0') * parseFloat(insights.purchase_roas)).toString() : '0'
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
      fields: 'adset_id,spend,impressions,clicks,purchases,purchase_roas',
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
        purchases: insights?.purchases || '0',
        revenue: insights?.purchase_roas ? (parseFloat(insights?.spend || '0') * parseFloat(insights.purchase_roas)).toString() : '0'
      };
    });

    return adSets;
  }

  async getAds(adAccountId: string, adSetId?: string, dateRange: string = 'last_30_days'): Promise<MetaAd[]> {
    const params: any = {
      fields: 'id,name,status,adset_id,creative',
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
      fields: 'ad_id,spend,impressions,clicks,purchases,purchase_roas,video_avg_percent_watched_actions,video_thruplay_watched_actions',
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
        purchases: insights?.purchases || '0',
        revenue: insights?.purchase_roas ? (parseFloat(insights?.spend || '0') * parseFloat(insights.purchase_roas)).toString() : '0',
        video_avg_percent_watched_actions: insights?.video_avg_percent_watched_actions,
        video_thruplay_watched_actions: insights?.video_thruplay_watched_actions
      };
    });

    return ads;
  }

  async getAccountInsights(adAccountId: string, dateRange: string = 'last_30_days'): Promise<any> {
    const response = await this.makeRequest(`/${adAccountId}/insights`, {
      level: 'account',
      fields: 'spend,impressions,clicks,purchases,purchase_roas,cpm,ctr,cpc',
      time_range: JSON.stringify({ since: this.getDateRange(dateRange).since, until: this.getDateRange(dateRange).until }),
      limit: '1'
    });

    return response.data[0] || {};
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

    return {
      since: since.toISOString().split('T')[0],
      until: today.toISOString().split('T')[0]
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
    // Hook rate = 3-second video views / impressions
    const videoViews = data.video_thruplay_watched_actions?.[0]?.value || 0;
    const impressions = parseInt(data.impressions || '0');
    return impressions > 0 ? (videoViews / impressions * 100) : 0;
  }

  private calculateThumbstopRate(data: any): number {
    // Thumbstop rate = average watch time percentage
    const avgWatchPercent = data.video_avg_percent_watched_actions?.[0]?.value || 0;
    return parseFloat(avgWatchPercent) || 0;
  }
}

export const metaAdsService = new MetaAdsService();