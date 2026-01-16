import axios from "axios";
import { UMAMI_ACCOUNT } from "@/common/constants/umami";
import { UmamiResponse, UmamiDataPoint } from "@/common/types/umami";
import { unstable_cache } from "next/cache";

const { api_key, base_url, endpoint, parameters, websites } = UMAMI_ACCOUNT;

const getWebsiteIdByDomain = (domain: string) => {
  const found = websites.find((w) => w.domain === domain);
  return found?.website_id;
};

const fetchPageViews = async (domain: string) => {
  const website_id = getWebsiteIdByDomain(domain);
  if (!website_id) return { status: 404, data: {}, error: "Website not found" };

  const url = `${base_url}/${website_id}${endpoint.page_views}`;
  try {
    const response = await axios.get(url, {
      headers: { Accept: "application/json", "x-umami-api-key": api_key || "" },
      params: parameters,
    });
    return { status: response.status, data: response.data };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: {},
      error: error.message,
    };
  }
};

const fetchWebsiteStats = async (domain: string) => {
  const website_id = getWebsiteIdByDomain(domain);
  if (!website_id) return { status: 404, data: {}, error: "Website not found" };

  const url = `${base_url}/${website_id}${endpoint.sessions}`;
  try {
    const response = await axios.get(url, {
      headers: { Accept: "application/json", "x-umami-api-key": api_key || "" },
      params: { startAt: parameters.startAt, endAt: parameters.endAt },
    });
    return { status: response.status, data: response.data };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: {},
      error: error.message,
    };
  }
};

export const getPageViewsByDataRange = unstable_cache(
  async (domain: string) => fetchPageViews(domain),
  ["umami-pv-key"],
  { revalidate: 3600, tags: ["umami-pv-tag"] },
);

export const getWebsiteStats = unstable_cache(
  async (domain: string) => fetchWebsiteStats(domain),
  ["umami-stats-key"],
  { revalidate: 3600, tags: ["umami-stats-tag"] },
);

const mergeData = (allResults: UmamiResponse[]): UmamiResponse => {
  const combined: UmamiResponse = {
    pageviews: [],
    sessions: [],
    websiteStats: {
      pageviews: { value: 0 },
      visitors: { value: 0 },
      visits: { value: 0 },
      countries: { value: 0 },
      events: { value: 0 },
    },
  };

  allResults.forEach((result) => {
    combined.websiteStats.pageviews.value +=
      result.websiteStats.pageviews.value || 0;
    combined.websiteStats.visitors.value +=
      result.websiteStats.visitors.value || 0;
    combined.websiteStats.visits.value += result.websiteStats.visits.value || 0;
    combined.websiteStats.events.value += result.websiteStats.events.value || 0;
    combined.websiteStats.countries.value = Math.max(
      combined.websiteStats.countries.value,
      result.websiteStats.countries.value || 0,
    );

    const mergeChart = (target: UmamiDataPoint[], source: UmamiDataPoint[]) => {
      if (!source) return;
      source.forEach((item) => {
        const existing = target.find((p) => p.x === item.x);
        if (existing) existing.y += item.y;
        else target.push({ ...item });
      });
    };

    mergeChart(combined.pageviews, result.pageviews);
    mergeChart(combined.sessions, result.sessions);
  });

  combined.pageviews.sort(
    (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime(),
  );
  combined.sessions.sort(
    (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime(),
  );

  return combined;
};

export const getAllWebsiteData = unstable_cache(
  async (): Promise<UmamiResponse> => {
    const results = await Promise.all(
      websites.map(async (w) => {
        const pv = await fetchPageViews(w.domain);
        const st = await fetchWebsiteStats(w.domain);
        return {
          pageviews: pv.data.pageviews || [],
          sessions: pv.data.sessions || [],
          websiteStats: st.data || {},
        };
      }),
    );
    return mergeData(results as UmamiResponse[]);
  },
  ["umami-all-key"],
  { revalidate: 60, tags: ["umami-all-tag"] },
);
