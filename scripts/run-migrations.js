process.stderr.write(
  "The legacy migration entrypoint is retired. Run `pnpm --filter api db:migrate` instead.\n",
);
process.exitCode = 1;
process.exit(0);
