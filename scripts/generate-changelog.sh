#!/bin/bash
# Generates changelog day by day
# Thanks to https://stackoverflow.com/a/2979587
NEXT=$(date +%F)
echo "# CHANGELOG"
echo ----------------------
git log --no-merges --format="%cd" --date=short | sort -u -r | while read DATE ; do
    GIT_PAGER=cat git log --no-merges --format=" * %s" --since=$DATE --until=$NEXT | awk '/fix|feat/'
    # You can use this to add dates
    [[ "$GIT_PAGER" != "" ]] && echo [$DATE]
    NEXT=$DATE
done
