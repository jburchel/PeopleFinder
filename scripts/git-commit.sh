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
    message="[Config] 🔧 Update configuration settings"
elif $has_js; then
    prefix="feat"
    message="[Feature] ✨ Update JavaScript functionality"
elif $has_css; then
    prefix="style"
    message="[Style] 🎨 Update styles and layout"
elif $has_html; then
    prefix="feat"
    message="[Feature] 📝 Update HTML structure"
else
    prefix="update"
    message="[Update] 🔄 General changes"
fi

# Add all changes
git add .

# Create a more descriptive commit message
num_files=$(echo "$changed_files" | wc -l)
git commit -m "$message" -m "Type: $prefix" -m "Files changed: $num_files" -m "Details: $changed_files"

# Push to GitHub
git push origin master

# Display success message
echo "✨ Changes committed and pushed successfully!"
echo "Commit message: $prefix: $message"
echo "Changed files: $changed_files"