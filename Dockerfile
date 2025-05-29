# build phase one, create the build
FROM node:20-alpine3.19 as build

# get some credit
LABEL maintainer="powen@renci.org"

# Create and set the working directory
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

# Add `.../node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# copy in the project package requirements spec
COPY package.json ./

# RUN chmod 777 /usr/src/app/node_modules

# install package components
RUN npm install

COPY . .

# get the common build arguments
ARG APP_VERSION=$(APP_VERSION)
ENV REACT_APP_VERSION=$APP_VERSION

# EXPOSE 3000

# start the web server
CMD ["npm", "start"]
