"use client";

import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

interface ConversionResult {
  blob: Blob;
  fileName: string;
}

export function useMp3Converter() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<string>("Select an audio file to convert to MP3.");

  useEffect(() => {
    let isMounted = true;
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    void ffmpeg
      .load()
      .then(() => {
        if (isMounted) {
          setReady(true);
          setStatus("Upload or drop an audio file to begin.");
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

  const convertToMp3 = async (file: File): Promise<ConversionResult> => {
    const ffmpeg = ffmpegRef.current;

    if (!ffmpeg) {
      throw new Error("FFmpeg is not ready yet. Please retry in a moment.");
    }

    const inputName = file.name;
    const baseName = inputName.replace(/\.[^.]+$/, "") || "audio";
    const outputName = `${baseName}.mp3`;

    setStatus("Encoding audio to MP3…");

    await ffmpeg.writeFile(inputName, await fetchFile(file));
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

    await Promise.allSettled([
      ffmpeg.deleteFile(inputName),
      ffmpeg.deleteFile(outputName),
    ]);

    setStatus("Conversion complete. Download your MP3 below.");

    return { blob, fileName: outputName };
  };

  return {
    ready,
    status,
    setStatus,
    convertToMp3,
  };
}
