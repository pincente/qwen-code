#!/bin/bash

# customize-instructions.sh - Helper script to customize Qwen Code operating instructions

echo "Qwen Code Autonomous Agent - Custom Instructions Helper"
echo "======================================================"
echo ""

# Check if QWEN.deploy.md exists
if [ ! -f "QWEN.deploy.md" ]; then
  echo "ERROR: QWEN.deploy.md not found in current directory"
  echo "Please run this script from the qwen-code directory"
  exit 1
fi

echo "Current QWEN.deploy.md preview:"
echo "------------------------------"
head -20 QWEN.deploy.md
echo ""
echo "... (showing first 20 lines only)"
echo ""

echo "Options:"
echo "1. Edit QWEN.deploy.md directly (recommended)"
echo "2. Copy an existing QWEN.md file to QWEN.deploy.md"
echo "3. Reset to default instructions"
echo "4. View current instructions"
echo "5. Exit"
echo ""

read -p "Select an option (1-5): " choice

case $choice in
  1)
    # Check for common editors
    if command -v nano &> /dev/null; then
      nano QWEN.deploy.md
    elif command -v vim &> /dev/null; then
      vim QWEN.deploy.md
    elif command -v vi &> /dev/null; then
      vi QWEN.deploy.md
    else
      echo "Please edit QWEN.deploy.md with your preferred text editor"
    fi
    ;;
  2)
    read -p "Enter the path to your existing QWEN.md file: " filepath
    if [ -f "$filepath" ]; then
      cp "$filepath" QWEN.deploy.md
      echo "Copied $filepath to QWEN.deploy.md"
    else
      echo "File not found: $filepath"
    fi
    ;;
  3)
    echo "Resetting to default instructions..."
    # This would restore the default content, but we'll just notify the user
    echo "To reset to defaults, you can revert QWEN.deploy.md from the repository"
    ;;
  4)
    echo "Current QWEN.deploy.md content:"
    echo "=============================="
    cat QWEN.deploy.md
    ;;
  5)
    echo "Exiting..."
    exit 0
    ;;
  *)
    echo "Invalid option. Please run the script again and select 1-5."
    ;;
esac

echo ""
echo "After making changes, remember to rebuild the Docker image:"
echo "  make -f Makefile.autonomous build"