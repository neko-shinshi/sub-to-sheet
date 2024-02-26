# sub-to-sheet
First, install 'bun' refer to: https://bun.sh/docs/installation
Put .srt and .xlsx files in /subs

In command line run once the first time to download /node_modules :
bun install

To convert .srt to .xlsx, in command line run:
bun start --to-xlsx

To convert .xlsx to .srt, in command line run:
bun start --to-srt