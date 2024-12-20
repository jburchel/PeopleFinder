#!/bin/bash

# Get the commit type
echo "Select commit type:"
echo "1) feat: New feature"
echo "2) fix: Bug fix"
echo "3) docs: Documentation changes"
echo "4) style: Code style changes"
echo "5) refactor: Code refactoring"
echo "6) test: Adding/updating tests"
read -p "Enter number (1-6): " commit_type

# Get the commit message
read -p "Enter commit message (keep under 50 chars): " commit_message

# Get optional description
read -p "Enter longer description (optional - press enter to skip): " commit_description

# Convert number to prefix
case $commit_type in
    1) prefix="feat";;
    2) prefix="fix";;
    3) prefix="docs";;
    4) prefix="style";;
    5) prefix="refactor";;
    6) prefix="test";;
    *) echo "Invalid option"; exit 1;;
esac

# Add all changes
git add .

# Create commit with proper format
if [ -z "$commit_description" ]
then
    git commit -m "$prefix: $commit_message"
else
    git commit -m "$prefix: $commit_message" -m "$commit_description"
fi

# Push to GitHub
git push origin main

echo "Changes committed and pushed successfully!" 