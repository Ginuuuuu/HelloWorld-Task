export function printWelcome(root) {
  console.log("\nNode Terminal File Manager");
  console.log("==========================");
  console.log(`Sandbox root: ${root}`);
  console.log('Type "help" for commands.\n');
}

export function printHelp() {
  console.log(`
Commands
--------
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
  find <path> [--name=text] [--ext=.js] [--case-sensitive]
  info <path>
  tree [path] [--depth=N]
  history
  undo
  redo
  clear
  help
  exit

Paths can be relative to the current directory or absolute paths inside
the application's sandbox root.

Examples
--------
  ls --sort=size --order=desc
  ls --files --hidden
  cd src
  mkdir logs
  touch logs/app.log
  copy logs backup
  move app.js src/app.js
  rename old.txt new.txt
  find . --ext=.js
  find . --name=README --case-sensitive
  info package.json
  tree . --depth=3
  delete backup
  history
  undo
  redo
`);
}
