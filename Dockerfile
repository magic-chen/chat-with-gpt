# 使用官方 Nginx 镜像作为基础镜像
FROM nginx:latest

# 删除默认的 Nginx 配置
RUN rm -rf /etc/nginx/conf.d/*

# 将本地构建好的静态文件复制到 Nginx 默认的 HTML 目录
COPY ./dist /usr/share/nginx/html

# 指定 Nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露 Nginx 默认的 HTTP 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
