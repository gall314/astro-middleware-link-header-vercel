import { defineMiddleware } from 'astro:middleware'
import type { Element, Root } from 'hast'
import { rehype } from 'rehype'
import { visit } from 'unist-util-visit'
import { isCssLink } from 'hast-util-is-css-link'
import { promises as fs } from 'fs'

const headers : { [key: string]: string } = {}

const middlewareTs = (headers:string) => `
import { next } from '@vercel/edge';
const headers : { [key: string]: string } = ${headers}

export default async function middleware(request: Request) {
  let path = new URL(request.url).pathname
  if(path.endsWith('index.html')) path = path.replace('index.html','')
  if(!path.endsWith('/')) path = path + '/'
  const link = headers[path]
  return next(link ? { headers: { 'Link': link } } : {});
}
`

async function updateVercelJson(url_path:string, linkHeaders:string) {
   headers[url_path] = linkHeaders
   await fs.writeFile("middleware.ts", middlewareTs(JSON.stringify(headers, null, 2)), 'utf8')
}

export const onRequest = defineMiddleware(async (context, next) => {
	console.log('Request:', context.url.pathname)
	const response = await next()
	if (response.headers.get('content-type') !== 'text/html') return response
	const html = await response.text()
	const links: Element[] = []
	const rehypeInstance = rehype().use(() => (tree: Root) => {
		let head: Element | undefined
		visit(tree, 'element', node => {
			if (node.tagName === 'head') head = node
			if (isCssLink(node))
				links.push({
					type: 'element',
					tagName: 'link',
					properties: { rel: 'preload', as: 'style', href: node.properties.href },
					children: []
				})
			if (node.tagName === 'img' &&
				node.properties?.loading === 'eager' &&
				node.properties?.fetchPriority === 'high'
			) {
				links.push({
					type: 'element',
					tagName: 'link',
					properties: { rel: 'preload', as: 'image', href: node.properties.src },
					children: []
				})
			}
		})
		head?.children.unshift(...links)
	})
	const file = await rehypeInstance.process(html)
	const linkHeaders = links.map(link => {
		const href = link.properties.href
		const otherparams = Object.entries(link.properties).filter(([key]) => key !== 'href')
		return `<${href}>; ${otherparams.map(([key, value]) => `${key}=${value}`).join('; ')}`
	}).join(', ')
	response.headers.set('Link', linkHeaders);
	await updateVercelJson(context.url.pathname, linkHeaders)
	return new Response(file.toString(), {
		status: response.status,
		headers: {
			 ...response.headers,
			'Content-Type': 'text/html',
			'Link': linkHeaders,
		}
	})
})
