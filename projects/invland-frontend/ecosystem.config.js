module.exports = {
  apps: [{
    name: 'public-frontend',
    script: './server.js',
    cwd: '/var/www/inlandv',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 4002,
      NEXT_PUBLIC_API_URL: 'https://your-api-url.com/api'
    },
    error_file: '/home/pressup-cms/.pm2/logs/public-frontend-error.log',
    out_file: '/home/pressup-cms/.pm2/logs/public-frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
}

