# astro-middleware-link-header-vercel
Astro Middleware that generates Link headers for Vercel. 

Good for setting up 103 Early Hints with CloudFlare.

The middleware will automatically detect the Main CSS file and create a `<link rel="preload">` headers in HTML head section and as a HTTP/2 Header.
It also looks for all eager loaded images with flag `fetchPriority="high"`.

You can further optimize you page load with CloudFlare or similar system to utilize 103 Early Hints.

To install you need the following packages:
```
npm install -D rehype unist-util-visit hast-util-is-css-link @astrojs/vercel
```
