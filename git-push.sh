#!/bin/bash

# Akariza Backend - Git Push Script
# Quick script to add, commit, and push all changes

echo "🚀 Akariza Backend - Git Push"
echo "============================="
echo ""

# Check if commit message is provided
if [ -z "$1" ]; then
    echo "❌ Error: Commit message is required"
    echo ""
    echo "Usage: ./git-push.sh \"Your commit message\""
    echo ""
    echo "Example:"
    echo "  ./git-push.sh \"Fixed bug in sales module\""
    echo ""
    exit 1
fi

MESSAGE=$1

echo "📝 Commit Message: $MESSAGE"
echo ""

# Add all changes
echo "📦 Adding all changes..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "$MESSAGE"

# Push
echo "🚀 Pushing to GitHub..."
git push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
else
    echo ""
    echo "❌ Push failed. Please check the error above."
    echo ""
    exit 1
fi
