
import { next } from '@vercel/edge';
const headers : { [key: string]: string } = { "/": "" }

export default async function middleware(request: Request) {
  let path = new URL(request.url).pathname
  if(path.endsWith('index.html')) path = path.replace('index.html','')
  if(!path.endsWith('/')) path = path + '/'
  const link = headers[path]
  return next(link ? { headers: { 'Link': link } } : {});
}
