# iRODS Zone Management Tool (ZMT)

A web application for managing an iRODS Zone.

## Installation & Run

### 1.Clone and repository from Github.
Clone the repository from Github.

```
git clone https://github.com/irods/irods_client_zone_management_tool
```

### 2. Install Docker Compose
You need to install docker engine, docker compose on your machine to get the application running.


### 3. Deploy the iRODS Client REST Mid-Tier API 
Please refer to [iRODS Client REST API](https://github.com/irods/irods_client_rest_cpp) and build this repository. You will need the hostname and port of this service.

### 4. Setup Environment Variables
Create a file named '.env' and place under the root directory. Please refer to sample.env file, setup the following environment variables and save the file.

```
REACT_PORT=
REACT_APP_REST_API_HOSTNAME=
REACT_APP_REST_API_PORT=
REACT_APP_APPBAR_LOGO=iRODS-logo.jpg
REACT_APP_LOGIN_LOGO=iRODS-logo-1.png
REACT_APP_BRANDING_NAME=Zone Management Tool
REACT_APP_PRIMARY_COLOR='#04bdaf'
```

### 5. Deploy the ZMT


#### Start Service
Use the following code to start service.
```
docker-compose up
```

#### Stop Service
```
docker-compose down
```

## Built With
- [React](https://reactjs.org/) - Reactive frontend framework built by Facebook
- [Material UI](https://material-ui.com/) - Material Design
