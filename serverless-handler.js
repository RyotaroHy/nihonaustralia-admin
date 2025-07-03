const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Check if this is a warmup request
const isWarmupRequest = event => {
  return event.warmup === true;
};

// Handle warmup requests
const handleWarmup = () => {
  console.log('Lambda warmup request received');
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Lambda warmed up' }),
  };
};

// Create Next.js app
const app = next({
  dev: false,
  conf: {
    // Use environment variable for static assets
    assetPrefix: process.env.NEXT_PUBLIC_STATIC_URL || '',
  },
});

const handle = app.getRequestHandler();

// Lambda handler
exports.handler = async (event, context) => {
  // Handle warmup requests
  if (isWarmupRequest(event)) {
    return handleWarmup();
  }

  // Ensure Next.js is ready
  await app.prepare();

  try {
    // Convert Lambda event to Node.js request format
    const { rawPath, rawQueryString, headers, body, isBase64Encoded } = event;

    const url = rawPath + (rawQueryString ? `?${rawQueryString}` : '');
    const parsedUrl = parse(url, true);

    // Create mock request and response objects
    const req = {
      url,
      method: event.requestContext?.http?.method || 'GET',
      headers: headers || {},
      body: isBase64Encoded ? Buffer.from(body, 'base64') : body,
    };

    let responseBody = '';
    const responseHeaders = {};
    let statusCode = 200;

    const res = {
      statusCode: 200,
      setHeader: (name, value) => {
        responseHeaders[name] = value;
      },
      getHeader: name => responseHeaders[name],
      removeHeader: name => {
        delete responseHeaders[name];
      },
      write: chunk => {
        responseBody += chunk;
      },
      end: chunk => {
        if (chunk) responseBody += chunk;
      },
      writeHead: (code, headers) => {
        statusCode = code;
        if (headers) {
          Object.assign(responseHeaders, headers);
        }
      },
    };

    // Handle the request with Next.js
    await handle(req, res, parsedUrl);

    // Return Lambda response format
    return {
      statusCode,
      headers: responseHeaders,
      body: responseBody,
      isBase64Encoded: false,
    };
  } catch (error) {
    console.error('Lambda handler error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Something went wrong',
      }),
    };
  }
};
