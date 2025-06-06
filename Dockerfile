# build phase one, create the build
FROM node:20-alpine3.19 AS build

# get some credit
LABEL maintainer="powen@renci.org"

# install git
RUN apk --no-cache add git

# Create and set the working directory & fix dubious git path
RUN mkdir -p /usr/src/app/ && git config --global --add safe.directory /usr/src/app
WORKDIR /usr/src/app/

# Add `.../node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# copy in the project package requirements spec
COPY package.json ./

# RUN chmod 777 /usr/src/app/node_modules

# install package components
RUN npm install

COPY . .

# start the web server
CMD ["npm", "start"]
