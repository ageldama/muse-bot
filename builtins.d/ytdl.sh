#!/bin/sh
chdir "${YTDL_DIR}"
youtube-dl --audio-format flac --audio-quality 0 "${1}"

