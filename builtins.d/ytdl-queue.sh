#!/bin/sh

URL=$(youtube-dl --audio-quality 0 -g "${1}")

mpc add "${URL}"


