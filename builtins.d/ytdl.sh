#!/bin/sh
cd "${YTDL_DIR}"
youtube-dl --audio-format flac --audio-quality 0 "${1}"

