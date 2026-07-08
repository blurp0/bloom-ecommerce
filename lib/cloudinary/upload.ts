import { cloudinary } from "./client";
import { env } from "../env";

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export function generateUploadSignature(folder: string): UploadSignatureResponse {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Prepare parameters to sign
  const paramsToSign = {
    timestamp,
    folder,
  };

  // Generate the signed request using API secret
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    folder,
  };
}
