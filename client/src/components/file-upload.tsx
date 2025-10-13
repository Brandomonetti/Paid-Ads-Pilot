import { useState, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Loader2, Image, Video, File } from 'lucide-react';
import { uploadFile, deleteFile, type UploadedFile, type UploadedFilesStructure } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface FileUploadProps {
  files: UploadedFilesStructure;
  onFilesChange: (files: UploadedFilesStructure) => void;
  bucket: string;
  folder: string;
  categoryKey: string;
  accept?: string;
  multiple?: boolean;
  testId: string;
  label?: string;
  description?: string;
}

export interface FileUploadHandle {
  uploadPendingFiles: () => Promise<void>;
  deletePendingFiles: () => Promise<void>;
}

interface PendingFile {
  file: File;
  name: string;
}

export const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(({
  files,
  onFilesChange,
  bucket,
  folder,
  categoryKey,
  accept,
  multiple = true,
  testId,
  label = "Upload Files",
  description
}, ref) => {
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  // Get files for this specific category
  const categoryFiles = files[categoryKey] || [];

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    uploadPendingFiles: async () => {
      if (pendingFiles.length === 0 && filesToDelete.length === 0) return;

      setIsUploading(true);
      const uploadedFiles: UploadedFile[] = [];

      try {
        // Upload pending files
        for (const pendingFile of pendingFiles) {
          const uploadedFile = await uploadFile(pendingFile.file, bucket, folder);
          uploadedFiles.push(uploadedFile);
        }

        // Delete marked files
        for (const fileToDelete of filesToDelete) {
          await deleteFile(bucket, fileToDelete.url);
        }

        // Update the files object
        const remainingFiles = categoryFiles.filter(
          f => !filesToDelete.some(df => df.url === f.url)
        );
        const updatedFiles = {
          ...files,
          [categoryKey]: [...remainingFiles, ...uploadedFiles]
        };
        onFilesChange(updatedFiles);

        // Clear pending state
        setPendingFiles([]);
        setFilesToDelete([]);

        if (uploadedFiles.length > 0 || filesToDelete.length > 0) {
          toast({
            title: "Success",
            description: `${uploadedFiles.length} file(s) uploaded${filesToDelete.length > 0 ? `, ${filesToDelete.length} file(s) removed` : ''}`
          });
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload files",
          variant: "destructive"
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    deletePendingFiles: async () => {
      setPendingFiles([]);
      setFilesToDelete([]);
    }
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newPendingFiles: PendingFile[] = selectedFiles.map(file => ({
      file,
      name: file.name
    }));

    setPendingFiles(prev => [...prev, ...newPendingFiles]);
    e.target.value = '';
  };

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMarkFileForDeletion = (fileToRemove: UploadedFile) => {
    setFilesToDelete(prev => [...prev, fileToRemove]);
  };

  const handleUnmarkFileForDeletion = (fileToRemove: UploadedFile) => {
    setFilesToDelete(prev => prev.filter(f => f.url !== fileToRemove.url));
  };

  const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename);
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    
    // Video files
    if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext)) {
      return <Video className="h-4 w-4 text-purple-500" />;
    }
    
    // Document files
    if (['pdf', 'doc', 'docx', 'txt', 'csv', 'xls', 'xlsx'].includes(ext)) {
      return <FileText className="h-4 w-4 text-orange-500" />;
    }
    
    // Default file icon
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-2">
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

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2 mt-3">
          <p className="text-xs font-medium text-muted-foreground">Pending uploads (will upload when you click Next):</p>
          {pendingFiles.map((pendingFile, index) => {
            const fileExt = getFileExtension(pendingFile.name);
            return (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-muted-foreground/20"
                data-testid={`pending-file-item-${index}`}
              >
                <div className="flex-shrink-0">
                  {getFileIcon(pendingFile.name)}
                </div>
                <span className="text-sm flex-1 truncate">
                  {pendingFile.name}
                </span>
                <Badge 
                  variant="outline" 
                  className="text-xs flex-shrink-0 bg-yellow-500/10 text-yellow-600 border-yellow-600/20"
                  data-testid={`pending-badge-${index}`}
                >
                  Pending
                </Badge>
                {fileExt && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs uppercase flex-shrink-0"
                    data-testid={`file-type-${index}`}
                  >
                    {fileExt}
                  </Badge>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemovePendingFile(index)}
                  data-testid={`button-remove-pending-file-${index}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Uploaded Files */}
      {categoryFiles.length > 0 && (
        <div className="space-y-2 mt-3">
          {categoryFiles.map((file, index) => {
            const fileExt = getFileExtension(file.name);
            const markedForDeletion = filesToDelete.some(f => f.url === file.url);
            return (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded-md ${
                  markedForDeletion 
                    ? 'bg-red-500/10 border border-red-500/20 opacity-50' 
                    : 'bg-muted hover-elevate'
                }`}
                data-testid={`file-item-${index}`}
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file.name)}
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex-1 truncate hover:underline"
                  data-testid={`file-link-${index}`}
                >
                  {file.name}
                </a>
                {markedForDeletion && (
                  <Badge 
                    variant="outline" 
                    className="text-xs flex-shrink-0 bg-red-500/10 text-red-600 border-red-600/20"
                    data-testid={`will-delete-badge-${index}`}
                  >
                    Will delete
                  </Badge>
                )}
                {fileExt && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs uppercase flex-shrink-0"
                    data-testid={`file-type-${index}`}
                  >
                    {fileExt}
                  </Badge>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => 
                    markedForDeletion 
                      ? handleUnmarkFileForDeletion(file)
                      : handleMarkFileForDeletion(file)
                  }
                  data-testid={`button-remove-file-${index}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';
