/** PM2 process file for VPS deployment. Usage: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "selfistar",
      script: "dist/server/node-build.mjs",
      cwd: "/var/www/vasnumero/selfistar",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      max_memory_restart: "512M",
      error_file: "/var/log/selfistar/error.log",
      out_file: "/var/log/selfistar/out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
