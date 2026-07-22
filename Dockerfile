FROM guergeiro/pnpm:26-10-alpine

# 1. 复制 docker 配置文件
COPY ["docker/", "/"]

# 2. 将 planet.js 源码复制到独立的 /app 目录（用于构建全局工具）
WORKDIR /app
COPY . /app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN npm config -g set registry https://registry.npmmirror.com

ENV PNPM_HOME="/usr/local/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 3. 安装工具链，并在 /app 目录下把本地源码全局安装为 CLI 工具
RUN apk add --no-cache nginx python3 make g++ && \
    chmod +x /entrypoint.sh && \
    mkdir -p /run/nginx && \
    rm -f /etc/nginx/http.d/default.conf && \
    mkdir -p /config && \
    pnpm install -g . --unsafe-perm

# 4. 切换到 Nginx 网页目录 /var/www/html 执行 planet 生成命令
WORKDIR /var/www/html
RUN planet i && \
    chown -R node /var/www/html && \
    apk del make g++ && \
    # （可选）安装完全局命令后可以清理 /app 源码目录以精简镜像
    rm -rf /app

EXPOSE 80

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
