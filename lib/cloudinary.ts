import { CLOUDINARY } from './config';

export async function uploadImage(uri: string): Promise<{ secure_url: string; public_id: string; delete_token?: string }>
{
  const data = new FormData();
  // React Native FormData file part
  data.append('file', { uri, name: 'upload.jpg', type: 'image/jpeg' } as any);
  data.append('upload_preset', CLOUDINARY.uploadPreset);
  if (CLOUDINARY.folder) data.append('folder', CLOUDINARY.folder);
  // Ask Cloudinary to return a temporary delete token
  data.append('return_delete_token', 'true');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`, {
    method: 'POST',
    body: data,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Cloudinary upload failed: ${res.status} ${t}`);
  }
  return res.json();
}
