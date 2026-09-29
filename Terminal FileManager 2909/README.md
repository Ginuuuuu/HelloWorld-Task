# Node Terminal File Manager

A modular interactive terminal file manager built with Node.js.

## Run

```bash
npm install
npm start
```

No external file-manager library is used. Filesystem operations use Node.js APIs.

## Commands

```text
help
ls [--sort=name|size|time] [--order=asc|desc] [--files|--dirs] [--hidden]
cd <path>
pwd
mkdir <name>
touch <name>
rename <source> <destination>
copy <source> <destination>
move <source> <destination>
delete <path>
cat <file>
find <path> [--name=...] [--ext=.js] [--case-sensitive]
info <path>
tree [path] [--depth=N]
clear
history
undo
redo
exit
```

## Safety

The application creates a sandbox root named `workspace` beside the project and prevents normal file operations from escaping it. Symlinks are treated as links and are not followed for destructive traversal.

## Notes

- Filesystem operations are asynchronous.
- Large file copies use streams.
- Copy progress is displayed.
- Recursive directory copy/move/delete are supported.
- Delete requires confirmation for directories.
- Undo/redo is implemented for common operations.
- An operation journal is maintained in `.file-manager/operations.json`.
- Ctrl+C performs graceful shutdown.
