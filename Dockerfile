FROM node:12.13.0-stretch-slim
MAINTAINER leopold.jacquot@gmail.com

EXPOSE 80

RUN apt-get update && \
    apt-get -y install bzip2 libfontconfig && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN npm install -g --unsafe-perm phantomjs-prebuilt@2.1.16

COPY . /home/node/manet

RUN npm i

VOLUME /home/node/manet/config/default.yaml

CMD /home/node/manet/bin/manet --port 80
