#!/bin/bash

# Define your programs array
declare -a programs=(
  "class.sous"
  "fib.sous"
  "functions.sous"
  "hello.sous"
  "loops.sous"
  "try.sous"
)

# Loop through the array and run your command for each program
for program in "${programs[@]}"; do
  echo "Running: node src/sous examples/$program parsed"
  node src/sous examples/$program parsed
done