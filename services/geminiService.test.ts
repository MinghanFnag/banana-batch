import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateImageBatchStream } from './geminiService';
import { AppSettings, GeneratedImage } from '../types';

const successResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: 'ZmFrZQ=='
            }
          }
        ]
      }
    }
  ]
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('gemini image proxy requests', () => {
  it('requests PNG output when generating through the Yunwu Gemini proxy', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const images: GeneratedImage[] = [];
    const settings: AppSettings = {
      batchSize: 1,
      aspectRatio: '16:9',
      resolution: '4K',
      providerConfig: {
        provider: 'gemini',
        apiKey: 'test_gemini_key_12345',
        baseUrl: 'https://yunwu.ai/v1beta',
        model: 'gemini-3-pro-image-preview'
      }
    };

    await generateImageBatchStream(
      'test_gemini_key_12345',
      'banana poster',
      [],
      settings,
      undefined,
      {
        onImage: (image) => images.push(image),
        onText: () => {},
        onProgress: () => {}
      },
      new AbortController().signal
    );

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

    expect(body.generationConfig.imageConfig).toEqual({
      aspectRatio: '16:9',
      imageSize: '4K',
      outputMimeType: 'image/png'
    });
    expect(images[0].mimeType).toBe('image/jpeg');
  });

  it('does not add experimental PNG output to non-Yunwu Gemini proxies', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const settings: AppSettings = {
      batchSize: 1,
      aspectRatio: '1:1',
      resolution: '2K',
      providerConfig: {
        provider: 'gemini',
        apiKey: 'test_gemini_key_12345',
        baseUrl: 'https://example.com/gemini/v1beta',
        model: 'gemini-3-pro-image-preview'
      }
    };

    await generateImageBatchStream(
      'test_gemini_key_12345',
      'banana poster',
      [],
      settings,
      undefined,
      {
        onImage: () => {},
        onText: () => {},
        onProgress: () => {}
      },
      new AbortController().signal
    );

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

    expect(body.generationConfig.imageConfig).toEqual({
      aspectRatio: '1:1',
      imageSize: '2K'
    });
  });

  it('falls back without PNG output when the Yunwu proxy rejects that field', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: 'Unknown name "outputMimeType" at generationConfig.imageConfig' } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(successResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    const images: GeneratedImage[] = [];
    const settings: AppSettings = {
      batchSize: 1,
      aspectRatio: '16:9',
      resolution: '4K',
      providerConfig: {
        provider: 'gemini',
        apiKey: 'test_gemini_key_12345',
        baseUrl: 'https://yunwu.ai/v1beta',
        model: 'gemini-3-pro-image-preview'
      }
    };

    await generateImageBatchStream(
      'test_gemini_key_12345',
      'banana poster',
      [],
      settings,
      undefined,
      {
        onImage: (image) => images.push(image),
        onText: () => {},
        onProgress: () => {}
      },
      new AbortController().signal
    );

    const firstBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    const secondBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));

    expect(firstBody.generationConfig.imageConfig.outputMimeType).toBe('image/png');
    expect(secondBody.generationConfig.imageConfig).toEqual({
      aspectRatio: '16:9',
      imageSize: '4K'
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(images[0].status).toBe('success');
  });
});
