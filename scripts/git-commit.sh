#!/bin/bash

# Get list of changed files
changed_files=$(git status --porcelain)

# Initialize variables for different types of changes
has_html=false
has_css=false
has_js=false
has_config=false

# Check file types that were changed
while IFS= read -r file; do
    if [[ $file == *".html"* ]]; then
        has_html=true
    elif [[ $file == *".css"* ]]; then
        has_css=true
    elif [[ $file == *".js"* ]]; then
        if [[ $file == *"config.js"* ]]; then
            has_config=true
        else
            has_js=true
        fi
    fi
done <<< "$changed_files"

# Determine commit type and message
if $has_config; then
    prefix="config"
    message="update configuration settings"
elif $has_js; then
    prefix="feat"
    message="update JavaScript functionality"
elif $has_css; then
    prefix="style"
    message="update styles and layout"
elif $has_html; then
    prefix="feat"
    message="update HTML structure"
else
    prefix="update"
    message="make general updates"
fi

# Add all changes
git add .

# Commit with generated message
git commit -m "$prefix: $message"

# Push to GitHub
git push origin main

# Display success message
echo "✨ Changes committed and pushed successfully!"
echo "Commit: $prefix: $message"

# Create a message for Cursor's Source Control Graph
cursor_message="🚀 Latest commit: $prefix: $message"
echo "$cursor_message" > .cursor-message

# Display the message in terminal with some styling
echo "\033[1;32m$cursor_message\033[0m" 