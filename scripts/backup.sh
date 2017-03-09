#!/bin/bash
usage="$(basename "$0") src_dir dest_dir -- script to safely copy large MapDB files ensuring that they don't get out of sync

where:
    -h  show this help text"

ext=db* # default extension to copy
dest="$2/$(date +'%Y%m%d_%H%M%S').bak"
while getopts ':h:d:e:' option; do
  case "$option" in
    h) echo "$usage"
       exit
       ;;
    :) printf "missing argument for -%s\n" "$OPTARG" >&2
       echo "$usage" >&2
       exit 1
       ;;
   \?) printf "illegal option: -%s\n" "$OPTARG" >&2
       echo "$usage" >&2
       exit 1
       ;;
  esac
done

shift $((OPTIND - 1))
source="$1"

echo "copying $ext from $source to $dest"
if [[ "$source" != */ ]]; then
  source="$source/"
fi

echo "Copying $ext files from $source to $dest..."

for i in $(find $source -name "*.$ext"); do
  orig_path="$i"
  # CHECKSUM=crc32
  dir=$(dirname "${orig_path}")
  # echo "dir $dir"
  fn=$(basename "${orig_path}")
  echo $orig_path
  orig_crc32=$(crc32 "$orig_path")

  subDirs=$(echo $orig_path | sed "s|$source||")
  new_path="$dest/$subDirs/$fn"

  # copy the file
  mkdir -p "$dest/$subDirs" && cp -p "$orig_path" "$new_path"
  new_crc32=$(crc32 "$new_path")

  # TODO: check that both ABC/XYZ.db and ABC/XYZ.db.p crc32s have not changed across orig and new
  #       if either have changed, repeat the process for the two files

  ["$a" -eq "$b"] && diff=false || diff=true
  echo "orig=${orig_crc32} new=${new_crc32} => diff=${diff}"
done
