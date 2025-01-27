#!/bin/bash

src_base="pages/cz"
dest_base="pages/en"

for i in $(find pages/cz -type f); do
  rel_path="${i#$src_base/}"
  dir_path=$(dirname "$rel_path")
  filename=$(basename "$rel_path")

  # Split filename and extension
  extension="${filename##*.}"
  base_name="${filename%.*}"

  # Create new filename with .cz before extension
  new_filename="${base_name}.cz.${extension}"

  # Create destination directory structure
  dest_dir="$dest_base/$dir_path"

  mv "$i" "$dest_dir/$new_filename"
done

rm -rf pages/cz

mv pages/en/* pages/
mv pages docs


echo "Add meta.json and meta.cz.json into docs dir"
echo "For czech language, add folder symlinks in the czech language in docs and update meta.cz.json accordingly."
echo "E.g. ln -s platform platforma"
