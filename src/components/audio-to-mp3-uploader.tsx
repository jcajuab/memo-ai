"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export function AudioToMp3Uploader() {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<string>(
    "Select an audio file to convert to MP3.",
  );
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [isEncoding, setIsEncoding] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  useEffect(() => {
    let isMounted = true;

    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    void ffmpeg
      .load()
      .then(() => {
        if (isMounted) {
          setReady(true);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setStatus(`Failed to initialize FFmpeg: ${String(error)}`);
        }
      });

    return () => {
      isMounted = false;
      ffmpegRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  async function handleFile(file: File) {
    setStatus("Preparing conversion...");
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(undefined);
    setFileName(undefined);

    try {
      setIsEncoding(true);
      const ffmpeg = ffmpegRef.current;

      if (!ffmpeg) {
        setStatus("FFmpeg is not ready yet. Please retry in a moment.");
        return;
      }

      const inputName = file.name;
      const baseName = inputName.replace(/\.[^.]+$/, "") || "audio";
      const outputName = `${baseName}.mp3`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      setStatus("Encoding audio to MP3…");
      await ffmpeg.exec([
        "-i",
        inputName,
        "-codec:a",
        "libmp3lame",
        "-b:a",
        "192k",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setFileName(outputName);
      setStatus("Conversion complete. Download your MP3 below.");

      await Promise.allSettled([
        ffmpeg.deleteFile(inputName),
        ffmpeg.deleteFile(outputName),
      ]);
    } catch (error) {
      setStatus(`Conversion failed: ${String(error)}`);
    } finally {
      setIsEncoding(false);
    }
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-border bg-background/80 p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Convert Audio to MP3</h2>
        <p className="text-sm text-muted-foreground">
          Upload any supported audio type (WAV, OGG, M4A, WebM, and more). The
          conversion runs locally in your browser using FFmpeg WebAssembly.
        </p>
      </div>
      <label
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/40 p-6 text-center transition hover:border-primary hover:bg-muted"
      >
        <span className="text-sm font-medium">
          {ready ? "Click to choose a file" : "Loading FFmpeg…"}
        </span>
        <span className="text-xs text-muted-foreground">
          {isEncoding ? "Encoding in progress…" : "Maximum ~25MB recommended"}
        </span>
        <input
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          disabled={!ready || isEncoding}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) {
              void handleFile(selected);
            }
          }}
        />
      </label>
      <p className="text-sm text-muted-foreground">{status}</p>
      {downloadUrl && fileName ? (
        <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground">MP3 file ready</p>
          </div>
          <Button asChild variant="secondary">
            <a href={downloadUrl} download={fileName}>
              Download
            </a>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
