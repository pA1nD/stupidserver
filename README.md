# The stupid server

A completely stupid server that you might want to use to prototype something very fast. Deploy it and it will take any data and send any data.

_**Warning:** If you are concerned about security, this is probably not what you are looking for!_

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Available Endpoints

### `/api` [POST]

Send any JSON. Stupid server sill store it.

### `/api?key=value` [GET]

Receive any JSON. If query parameter present, data will be filtered. One or multiple query parameters are directly passed to mongodb's .filter() function.

### `/files/upload` [POST]

Receive a picture. Send it as form-data with the key `file`. The endpoint will return a json with a key `fileUrl` which contains the location of the file.
