FROM    ghcr.io/pnpm/pnpm:latest
WORKDIR /var/www/html

COPY    ["docker/", "/"]
RUN     sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN     npm config -g set registry https://registry.npmmirror.com
RUN     apk add --no-cache nginx python3 && \
        make g++ && \
        chmod +x /entrypoint.sh && \
        mkdir -p /run/nginx && \
        rm -f /etc/nginx/http.d/default.conf && \
        mkdir -p /config && \
        pnpm install -g planet.js --unsafe-perm && \
        planet i && \
        chown -R node /var/www/html && \
        apk del make g++

EXPOSE 80

ENTRYPOINT  ["/bin/sh", "/entrypoint.sh"]
