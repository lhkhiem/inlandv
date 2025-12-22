module.exports = {
  apps: [{
    name: 'inlandv-frontend',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 4002,
      HOSTNAME: '0.0.0.0',
      NEXT_PUBLIC_API_URL: 'http://localhost:4000/api'
    },
    error_file: './logs/inlandv-frontend-error.log',
    out_file: './logs/inlandv-frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};


