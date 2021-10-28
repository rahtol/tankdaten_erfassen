FROM node:13-alpine

ENV MSSQL_DB_USERNAME=sa \
    MSSQL_DB_PWD=Werder,00

RUN mkdir -p /home/app
RUN mkdir -p /home/certificate

COPY . /home/app

# set default dir so that next commands executes in /home/app dir
WORKDIR /home/app

# will execute npm install in /home/app because of WORKDIR
RUN npm install

# no need for /home/app/server.js because of WORKDIR
CMD ["node", "server.js"]

