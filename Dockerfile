# build phase one, create the build
FROM node:20-alpine3.19 as build

# get some credit
LABEL maintainer="powen@renci.org"

# update the base image
RUN apk update
RUN apk add --upgrade apk-tools
RUN apk upgrade --available

# update the image
#apk upgrade --no-cache

# Create and set the working directory
RUN mkdir /src
WORKDIR /src

# Add `.../node_modules/.bin` to $PATH
ENV PATH /src/node_modules/.bin:$PATH

# copy in the project package requirements spec
COPY package*.json /src/

# install package components
RUN npm install

# get the common build arguments
ARG APP_VERSION=$(APP_VERSION)
ENV REACT_APP_VERSION=$APP_VERSION

# Copy in source files
COPY . /src

# Build the app
RUN npm run build

####################
## startup the nginx server
####################
FROM ghcr.io/nginxinc/nginx-unprivileged:1.27-alpine3.19

# get the source files for the site in the right place
COPY --from=build /src/dist /usr/share/nginx/html

# disable nginx user because now this is running as non-root
RUN sed -i 's/user nginx;/#user nginx;/g' /etc/nginx/nginx.conf

# copy in the configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# start the web server
CMD ["nginx", "-g", "daemon off;"]
