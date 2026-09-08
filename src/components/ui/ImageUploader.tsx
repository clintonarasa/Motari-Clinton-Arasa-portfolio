import React, { useState } from "react";
import { uploadImage } from "../../../s3";
import { Loader2, UploadCloud, CheckCircle2 } from "lucide-react";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function ImageUploader({ onUploadSuccess, onError, className = "" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Generate a unique file name to prevent overwriting existing images
      const fileExtension = file.name.split('.').pop();
      const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      
      // Trigger the upload to AWS/Cloudflare R2
      const uploadedUrl = await uploadImage(file, fileName);
      
      setPreview(uploadedUrl);
      onUploadSuccess(uploadedUrl);
      
    } catch (error: any) {
      console.error("Error uploading image:", error);
      if (onError) onError(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer relative hover:bg-muted/50 transition-colors ${className}`}>
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      {uploading ? (
        <div className="flex flex-col items-center pointer-events-none">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Uploading to cloud...</p>
        </div>
      ) : preview ? (
        <div className="flex flex-col items-center pointer-events-none">
          <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-sm font-medium text-green-600 mb-2">Upload Complete!</p>
          <img src={preview} alt="Preview" className="h-24 w-auto object-cover rounded-md border mt-2" />
        </div>
      ) : (
        <div className="flex flex-col items-center pointer-events-none">
          <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Click or drag image to upload</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB</p>
        </div>
      )}
    </div>
  );
}