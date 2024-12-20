import { list } from '@vercel/blob';
 
export async function GET(request: Request) {
  const { blobs } = await list();
  return Response.json(blobs);
}