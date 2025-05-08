# 使用官方PostgreSQL镜像（基于Debian）
FROM postgres:15-alpine

# 设置环境变量（可覆盖）
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword
ENV POSTGRES_DB=mydatabase
ENV PGDATA=/var/lib/postgresql/data/pgdata

# 复制初始化脚本
COPY ./init-scripts/ /docker-entrypoint-initdb.d/

# 复制自定义配置
COPY postgresql.conf /etc/postgresql/
COPY pg_hba.conf /etc/postgresql/

# 数据卷声明
VOLUME /var/lib/postgresql/data

# 暴露默认端口
EXPOSE 5432

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s \
  CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB