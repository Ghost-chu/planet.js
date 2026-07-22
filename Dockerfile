FROM guergeiro/pnpm:26-10-alpine

# 1. 复制 docker 配置文件
COPY ["docker/", "/"]

# 2. 将源码复制到 /app 目录
WORKDIR /app
COPY . /app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN npm config -g set registry https://registry.npmmirror.com

# 3. 安装工具链，并在 /app 目录下进行普通的本地安装
RUN apk add --no-cache nginx python3 make g++ && \
    chmod +x /entrypoint.sh && \
    mkdir -p /run/nginx && \
    rm -f /etc/nginx/http.d/default.conf && \
    mkdir -p /config && \
    # 进行常规安装（不加 -g），只在当前 /app 目录下安装依赖
    pnpm install && \
    # 确保执行文件有权限（防止宿主机的权限问题带入镜像）
    chmod +x /app/bin/planet && \
    # 手动把可执行文件链接到系统的原生 bin 目录，确保 100% 能在任何地方调用
    ln -s /app/bin/planet /usr/local/bin/planet && \
    # 清理 C++ 编译环境，减小镜像体积 (注意：这里绝对不能删除 /app)
    apk del make g++

# 4. 切换到网站生成目录
WORKDIR /var/www/html

# 此时直接运行 planet 绝对能找到
RUN planet i && \
    chown -R node /var/www/html

EXPOSE 80

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
