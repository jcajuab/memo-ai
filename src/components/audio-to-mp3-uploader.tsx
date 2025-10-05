"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type TranscriptionResponse,
  transcribeBlob,
} from "@/services/transcription.service";

// Move regex to top level for performance
const FILE_EXTENSION_REGEX = /\.[^.]+$/;

export function AudioToMp3Uploader() {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<string>(
    "Select an audio file to convert to MP3."
  );
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [isEncoding, setIsEncoding] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResponse>();
  const ffmpegRef = useRef<FFmpeg | null>(null);

  useEffect(() => {
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg
      .load()
      .then(() => {
        setReady(true);
      })
      .catch((error) => {
        setStatus(`Failed to initialize FFmpeg: ${String(error)}`);
      });

    return () => {
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
    setTranscription(undefined);

    try {
      setIsEncoding(true);
      const ffmpeg = ffmpegRef.current;

      if (!ffmpeg) {
        setStatus("FFmpeg is not ready yet. Please retry in a moment.");
        return;
      }

      const inputName = file.name;
      const baseName = inputName.replace(FILE_EXTENSION_REGEX, "") || "audio";
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
      const blob = new Blob([data as unknown as ArrayBuffer], {
        type: "audio/mpeg",
      });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setFileName(outputName);
      setStatus("Conversion complete. Starting transcription...");

      // Start transcription
      setIsTranscribing(true);
      try {
        const transcriptionResult = await transcribeBlob(blob);
        setTranscription(transcriptionResult);
        setStatus("Transcription complete! Results shown below.");
      } catch (transcriptionError) {
        setStatus(
          `Conversion complete, but transcription failed: ${String(transcriptionError)}`
        );
      } finally {
        setIsTranscribing(false);
      }

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
        <h2 className="font-semibold text-xl">Convert Audio to MP3</h2>
        <p className="text-muted-foreground text-sm">
          Upload any supported audio type (WAV, OGG, M4A, WebM, and more). The
          conversion runs locally in your browser using FFmpeg WebAssembly.
        </p>
      </div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-border/70 border-dashed bg-muted/40 p-6 text-center transition hover:border-primary hover:bg-muted">
        <span className="font-medium text-sm">
          {ready ? "Click to choose a file" : "Loading FFmpeg…"}
        </span>
        <span className="text-muted-foreground text-xs">
          {isEncoding || isTranscribing
            ? "Processing…"
            : "Maximum ~25MB recommended"}
        </span>
        <input
          accept="audio/*,video/*"
          className="hidden"
          disabled={!ready || isEncoding || isTranscribing}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) {
              handleFile(selected).catch((error) => {
                setStatus(`File processing failed: ${String(error)}`);
              });
            }
          }}
          type="file"
        />
      </label>
      <p className="text-muted-foreground text-sm">{status}</p>
      {downloadUrl && fileName ? (
        <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
          <div className="space-y-1">
            <p className="font-medium text-sm">{fileName}</p>
            <p className="text-muted-foreground text-xs">MP3 file ready</p>
          </div>
          <Button asChild variant="secondary">
            <a download={fileName} href={downloadUrl}>
              Download
            </a>
          </Button>
        </div>
      ) : null}
      {transcription ? (
        <div className="space-y-3 rounded-xl bg-muted/40 p-4">
          <div className="space-y-1">
            <p className="font-medium text-sm">Transcription Complete</p>
            <p className="text-muted-foreground text-xs">
              {transcription.response.word_count} words • Check console for full
              details
            </p>
          </div>
          <div className="rounded-lg bg-background p-3">
            <p className="text-sm">{transcription.response.text}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
