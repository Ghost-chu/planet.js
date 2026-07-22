#!/bin/sh

CONFIG_FILE="/config/config.yml"

if [ ! -s "${CONFIG_FILE}" ]; then
    echo "[ERROR] Configuration not found at /config/config.yml..."
    echo "Please mount your configuration at /config/config.yml!"
    echo "Exiting..."
    exit 1
else
    # 复制配置文件到工作目录
    cp "${CONFIG_FILE}" /var/www/html/config.yml
    
    # 修正：加上引号，并显式 cd 到 /var/www/html 下执行
    echo "[INFO] Running initial planet build..."
    su node -c "cd /var/www/html && planet config.yml"
fi

if [ -z "${REFRESH_INTERVAL}" ]; then
    REFRESH_INTERVAL="30" # 单位：分钟
fi

echo "[INFO] Setting up cron job with interval: ${REFRESH_INTERVAL}m"

# 修正：
# 1. 显式设置 PATH，防止 crond 找不到 node 或 planet
# 2. 用 > 覆盖而不是 >> 避免重复追加
# 3. 任务内部 cd 到 /var/www/html 再执行 planet config.yml
cat <<EOF > /etc/crontabs/root
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
*/${REFRESH_INTERVAL} * * * * su node -c "cd /var/www/html && planet config.yml" > /dev/null 2>&1
EOF

# 启动定时任务服务与 Nginx
crond
exec nginx -g "daemon off;"
