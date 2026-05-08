import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  label?: string;
  compact?: boolean;
}

export function ImageUpload({ onUpload, label = "Télécharger une image", compact }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      toast.success("Image téléchargée");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du téléchargement");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (compact) {
    return (
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer hover:bg-muted p-1.5 rounded transition-colors flex items-center justify-center h-8 w-8"
        title={label || "Insérer une image"}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*" 
          className="hidden" 
        />
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[var(--cyan-bright)]" />
        ) : (
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center justify-between">
        {label}
        <span className="text-[10px] text-muted-foreground font-normal">Max 5MB • WebP recommandé</span>
      </label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*" 
          className="hidden" 
        />
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-[var(--cyan-bright)]" />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="text-xs text-muted-foreground">Cliquez pour choisir ou glisser-déposer</span>
      </div>
    </div>
  );
}
