import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { uploadFile, deleteFile, type UploadedFile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  bucket: string;
  folder: string;
  accept?: string;
  multiple?: boolean;
  testId: string;
  label?: string;
  description?: string;
}

export function FileUpload({
  files,
  onFilesChange,
  bucket,
  folder,
  accept,
  multiple = true,
  testId,
  label = "Upload Files",
  description
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const uploadedFiles: UploadedFile[] = [];

    try {
      for (const file of selectedFiles) {
        const uploadedFile = await uploadFile(file, bucket, folder);
        uploadedFiles.push(uploadedFile);
      }

      onFilesChange([...files, ...uploadedFiles]);
      toast({
        title: "Success",
        description: `${uploadedFiles.length} file(s) uploaded successfully`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveFile = async (fileToRemove: UploadedFile, index: number) => {
    try {
      await deleteFile(bucket, fileToRemove.url);
      const updatedFiles = files.filter((_, i) => i !== index);
      onFilesChange(updatedFiles);
      toast({
        title: "Success",
        description: "File removed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove file",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-2">
      {files.length > 0 && (
        <div className="space-y-2 mb-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-md bg-muted"
              data-testid={`file-item-${index}`}
            >
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm flex-1 truncate hover:underline"
                data-testid={`file-link-${index}`}
              >
                {file.name}
              </a>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveFile(file, index)}
                data-testid={`button-remove-file-${index}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <input
          type="file"
          id={testId}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <label htmlFor={testId}>
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading}
            data-testid={testId}
            asChild
          >
            <span>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                label
              )}
            </span>
          </Button>
        </label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
