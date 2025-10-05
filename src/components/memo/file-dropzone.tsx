"use client";

import { useCallback, useEffect, useState } from "react";
import { Upload } from "lucide-react";

import { useMp3Converter } from "@/hooks/use-mp3-converter";
import { Button } from "@/components/ui/button";
import type { TranscriptionResponse } from "@/services/transcription.service";
import { transcribeBlob } from "@/services/transcription.service";

interface MemoFileDropzoneProps {
  onFileReady?: (file: File | null) => void;
  onTranscriptionComplete?: (result: TranscriptionResponse | null) => void;
}

export function MemoFileDropzone({
  onFileReady,
  onTranscriptionComplete,
}: MemoFileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const { ready, status, setStatus, convertToMp3 } = useMp3Converter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) {
        setConvertedFile(null);
        setStatus("Upload or drop an audio file to begin.");
        onFileReady?.(null);
        onTranscriptionComplete?.(null);
        return;
      }

      setIsProcessing(true);
      onTranscriptionComplete?.(null);

      try {
        const { blob, fileName } = await convertToMp3(file);
        const url = URL.createObjectURL(blob);
        const mp3File = new File([blob], fileName, { type: "audio/mpeg" });

        setConvertedFile(mp3File);
        setDownloadUrl((previous) => {
          if (previous) {
            URL.revokeObjectURL(previous);
          }
          return url;
        });
        onFileReady?.(mp3File);

        setStatus("Conversion complete. Starting transcription…");
        setIsTranscribing(true);

        try {
          const transcription = await transcribeBlob(blob);
          setStatus("Transcription complete! Results shown below.");
          onTranscriptionComplete?.(transcription);
        } catch (error) {
          const message =
            error instanceof Error
              ? `Conversion complete, but transcription failed: ${error.message}`
              : "Conversion complete, but transcription failed.";
          setStatus(message);
          onTranscriptionComplete?.(null);
        } finally {
          setIsTranscribing(false);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to process audio file.";
        setStatus(message);
        onFileReady?.(null);
        onTranscriptionComplete?.(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [convertToMp3, onFileReady, onTranscriptionComplete, setStatus],
  );

  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragIn = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        await handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const resetUpload = () => {
    handleFile(null);
    setIsTranscribing(false);
    setConvertedFile(null);
    setDownloadUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return undefined;
    });
  };

  return (
    <div className="w-full mx-auto">
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-primary/30 rounded-2xl p-8 text-center transition-all duration-300 ease-in-out bg-gradient-to-br from-primary/5 to-primary/10 ${
          isDragging ? "scale-[1.02] border-primary" : "hover:border-primary/50"
        }`}
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="memo-file-upload">
              <Button
                size="lg"
                className="w-full max-w-xs h-12 text-base font-semibold relative overflow-hidden group"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}
                disabled={!ready || isProcessing}
                onClick={() => document.getElementById("memo-file-upload")?.click()}
              >
                <span className="relative z-10">
                  {convertedFile ? "Upload New File" : ready ? "Upload Audio" : "Loading FFmpeg…"}
                </span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </Button>
            </label>
            <input
              id="memo-file-upload"
              type="file"
              accept="audio/*,video/*"
              onChange={onChange}
              className="hidden"
              disabled={!ready || isProcessing}
            />
            <p className="text-sm text-muted-foreground pt-2">
              or drop audio/video here (converted locally to MP3)
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            {isProcessing || isTranscribing
              ? "Processing… please keep this tab open."
              : status}
          </p>

          {convertedFile && (
            <div className="pt-4 border-t border-primary/20">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {convertedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(convertedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {downloadUrl ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild variant="secondary">
                      <a href={downloadUrl} download={convertedFile.name}>
                        Download MP3
                      </a>
                    </Button>
                    <Button variant="ghost" onClick={resetUpload}>
                      Remove File
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
