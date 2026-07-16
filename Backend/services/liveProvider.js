const crypto = require('crypto');

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || data.message || `Live provider returned ${response.status}`);
  }
  return data;
}

async function createMuxStream() {
  const id = process.env.MUX_TOKEN_ID;
  const secret = process.env.MUX_TOKEN_SECRET;
  if (!id || !secret) throw new Error('Mux credentials are not configured');

  const result = await fetchJson('https://api.mux.com/video/v1/live-streams', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      playback_policy: ['public'],
      new_asset_settings: { playback_policy: ['public'] },
      latency_mode: 'low',
    }),
  });

  const stream = result.data;
  return {
    provider: 'mux',
    providerStreamId: stream.id,
    streamKey: stream.stream_key,
    ingestUrl: 'rtmps://global-live.mux.com:443/app',
    playbackUrl: `https://stream.mux.com/${stream.playback_ids[0].id}.m3u8`,
    metadata: { playbackId: stream.playback_ids[0].id },
  };
}

async function createCloudflareStream() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) throw new Error('Cloudflare Stream credentials are not configured');

  const result = await fetchJson(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meta: { name: `Fanora ${Date.now()}` }, recording: { mode: 'automatic' } }),
    },
  );

  const stream = result.result;
  return {
    provider: 'cloudflare',
    providerStreamId: stream.uid,
    streamKey: stream.rtmps.streamKey,
    ingestUrl: stream.rtmps.url,
    playbackUrl: stream.webRTCPlayback?.url || stream.srt?.url || null,
    metadata: { webRTCPlayback: stream.webRTCPlayback },
  };
}

function createExternalStream() {
  const streamKey = crypto.randomBytes(24).toString('hex');
  const rtmpBase = (process.env.LIVE_RTMP_BASE || '').replace(/\/$/, '');
  const hlsBase = (process.env.LIVE_HLS_BASE || '').replace(/\/$/, '');
  if (!rtmpBase || !hlsBase) {
    throw new Error('LIVE_RTMP_BASE and LIVE_HLS_BASE must be configured');
  }
  return {
    provider: 'external',
    providerStreamId: streamKey,
    streamKey,
    ingestUrl: rtmpBase,
    playbackUrl: `${hlsBase}/${streamKey}.m3u8`,
    metadata: {},
  };
}

async function createLiveInput() {
  const provider = (process.env.LIVE_PROVIDER || 'external').toLowerCase();
  if (provider === 'mux') return createMuxStream();
  if (provider === 'cloudflare') return createCloudflareStream();
  return createExternalStream();
}

async function disableLiveInput(stream) {
  if (stream.provider === 'mux' && stream.providerStreamId) {
    const id = process.env.MUX_TOKEN_ID;
    const secret = process.env.MUX_TOKEN_SECRET;
    await fetchJson(`https://api.mux.com/video/v1/live-streams/${stream.providerStreamId}/disable`, {
      method: 'PUT',
      headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}` },
    });
  }
  return true;
}

module.exports = { createLiveInput, disableLiveInput };
