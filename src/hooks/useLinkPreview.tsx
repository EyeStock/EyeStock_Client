import {useEffect, useMemo, useState} from 'react';
import {Image} from 'react-native';
export type LinkPreviewMeta = {
  url: string;
  siteName?: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
};
const MOCK: Record<string, LinkPreviewMeta> = {
  'https://news.mt.co.kr/mtview.php?no=2025082813314052084': {
    url: 'https://news.mt.co.kr/mtview.php?no=2025082813314052084',
    siteName: '머니투데이',
    title: '예시) 8월 28일 경제 이슈 총정리',
    description: '금리·주식·환율 등 핵심 포인트를 한 번에 정리했습니다.',
    image: 'https://img.mt.co.kr/mt_static/img/mt_fb_share.png',
    favicon: 'https://news.mt.co.kr/favicon.ico',
  },
  'https://www.yna.co.kr/view/AKR20250828028000017?input=1195m': {
    url: 'https://www.yna.co.kr/view/AKR20250828028000017?input=1195m',
    siteName: '연합뉴스',
    title: '예시) 정부, 새로운 발표…주요 내용은?',
    description: '정책 방향과 향후 일정에 대한 개요를 담았습니다.',
    image: 'https://img.yna.co.kr/etc/logo/og_yna.png',
    favicon: 'https://www.yna.co.kr/favicon.ico',
  },
};
const cache = new Map<string, LinkPreviewMeta>();

const getDomain = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};
const abs = (base: string, maybe: string | undefined) => {
  if (!maybe) return undefined;
  try {
    if (maybe.startsWith('http://') || maybe.startsWith('https://'))
      return maybe;
    return new URL(maybe, base).toString();
  } catch {
    return undefined;
  }
};

function pickMeta(html: string, url: string): LinkPreviewMeta {
  const rx = (attr: 'property' | 'name', key: string) =>
    new RegExp(
      `<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["']`,
      'i',
    ).exec(html)?.[1];
  let title = rx('property', 'og:title');
  let description =
    rx('property', 'og:description') || rx('name', 'description');
  let siteName = rx('property', 'og:site_name') || getDomain(url);
  let image =
    rx('property', 'og:image') ||
    rx('property', 'og:image:url') ||
    rx('property', 'og:image:secure_url');
  if (!title) title = rx('name', 'twitter:title');
  if (!description) description = rx('name', 'twitter:description');
  if (!image)
    image = rx('name', 'twitter:image') || rx('name', 'twitter:image:src');

  if (!title) {
    const t = /<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1];
    if (t) title = t;
  }
  const fav =
    /<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]+href=["']([^"']+)["']/i.exec(
      html,
    )?.[1];

  return {
    url,
    siteName,
    title: title ?? getDomain(url),
    description,
    image: abs(url, image),
    favicon: abs(url, fav),
  };
}

async function fetchHTML(url: string, timeoutMs = 6000): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 13; RN) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
    signal: ctrl.signal,
  });
  clearTimeout(timer);
  return await res.text();
}

async function resolveMeta(url: string): Promise<LinkPreviewMeta> {
  if (cache.has(url)) return cache.get(url)!;
  if (MOCK[url]) {
    cache.set(url, MOCK[url]);
    return MOCK[url];
  }
  const html = await fetchHTML(url);
  const metaRefresh =
    /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"';>]+)[^"']*["']/i.exec(
      html,
    )?.[1];
  if (metaRefresh) {
    const next = abs(url, metaRefresh)!;
    const html2 = await fetchHTML(next);
    const meta2 = pickMeta(html2, next);
    cache.set(url, meta2);
    return meta2;
  }
  const meta = pickMeta(html, url);
  if (meta.image) {
    try {
      await Image.prefetch(meta.image);
    } catch {}
  }

  cache.set(url, meta);
  return meta;
}

export function useLinkPreview(url?: string) {
  const [data, setData] = useState<LinkPreviewMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    if (!url) {
      setData(null);
      setErr(null);
      return;
    }

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const meta = await resolveMeta(url);
        if (!alive) return;
        setData(meta);
      } catch (e: any) {
        if (!alive) return;
        setErr(e);
        setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [url]);

  return {data, loading, error};
}
