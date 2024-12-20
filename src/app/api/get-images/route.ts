import { list } from '@vercel/blob';
 
export async function GET() {
  const { blobs } = await list();
  return Response.json(blobs);
}