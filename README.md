# astro-middleware-link-header-vercel

Astro Middleware that generates Link headers for Vercel.

Good for setting up 103 Early Hints with Cloudflare.

The middleware will automatically detect the main CSS file and create a `<link rel="preload">` header in the HTML head section and as an `HTTP/2` header. 

It also looks for all eager-loaded images with the flag `fetchPriority="high"`.

You can further optimize your page load with Cloudflare or a similar system to utilize 103 Early Hints.

To install, you need the following packages:
```
npm install -D rehype unist-util-visit hast-util-is-css-link @astrojs/vercel
```
