#!/bin/bash

# test-env-parsing.sh - Test script for environment file parsing

echo "Testing environment file parsing..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found."
    exit 1
fi

# Test REPO_URL parsing
REPO_URL_VALUE=$(grep '^REPO_URL=' .env | cut -d '=' -f 2-)
if [ -z "$REPO_URL_VALUE" ]; then
    echo "ERROR: REPO_URL is not set in .env file"
    exit 1
else
    echo "REPO_URL is set to: $REPO_URL_VALUE"
fi

# Test GEMINI_API_KEY parsing
GEMINI_API_KEY_VALUE=$(grep '^GEMINI_API_KEY=' .env | cut -d '=' -f 2-)
QWEN_OAUTH_TOKEN_VALUE=$(grep '^QWEN_OAUTH_TOKEN=' .env | cut -d '=' -f 2-)

if [ -z "$GEMINI_API_KEY_VALUE" ] && [ -z "$QWEN_OAUTH_TOKEN_VALUE" ]; then
    echo "ERROR: Either GEMINI_API_KEY or QWEN_OAUTH_TOKEN must be set in .env file"
    exit 1
else
    if [ -n "$GEMINI_API_KEY_VALUE" ]; then
        echo "GEMINI_API_KEY is set"
    fi
    if [ -n "$QWEN_OAUTH_TOKEN_VALUE" ]; then
        echo "QWEN_OAUTH_TOKEN is set"
    fi
fi

echo "All environment variables are correctly set!"