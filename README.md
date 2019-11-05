# pagination-endpoint
[![CircleCI Shield](https://img.shields.io/circleci/build/github/Kiwi-x-Kiwi/pagination-endpoint/master)](https://github.com/Kiwi-x-Kiwi/pagination-endpoint/) [![Last Commit Shield](https://img.shields.io/github/last-commit/Kiwi-x-Kiwi/pagination-endpoint)](https://circleci.com/gh/Kiwi-x-Kiwi/pagination-endpoint)

Pagination is a technique used to make large data sets more manageable and easier to work with.  This project aims to implement a basic API endpoint with paginated results closely following the guidelines provided by MDLive. 

You can visit the live site hosted on Heroku [here](https://paginated-apps.herokuapp.com/apps).
Or if you're interested in seeing the integrated test cases on Circle CI [click here](https://circleci.com/gh/Kiwi-x-Kiwi/pagination-endpoint)

## Table of Contents
- [Setup](#setup)
- [API Documentation](#api-documentation)
- [Integrated Testing](#integrated-testing)
- [Challenges](#challenges)
- [Afterthoughts](#afterthoughts)

## Setup
The database is first seeded with 999 apps following the model shown below:
```
{
  id: 1
  name: 'my-app-001'
},

...,

{
  id: 999
  name: 'my-app-999'
}
```

## API Documentation
This API only has one endpoint for getting data ([/apps](https://paginated-apps.herokuapp.com/apps)) and the endpoint is programmed to accept query parameters so clients can specify the range of values to return.

By default, clients can retrieve an array of the first 50 objects (sorted by id) stored in the database by going to the endpoint `/apps`.

The client can also provide a `range` query to the endpoint in the form of a JSON object (e.g.`/apps?range={"by":"name","start":10,"end":50,"max":5,"order":"asc"}`) in the url. The fields in the range object affect the returned JSON array in the following manner:

* `by`: Determines whether to sort by `id` or `name`.  Only required field and has to be either `id` or `name`.  In the event that the value is not provided or invalid, the server will return a 400 error code.

* `start`: Determines the starting index in the form of a number or string depending on the `by` field.  Defaults to `1` if not provided or the value provided is `< 1`.

* `end`: Similar to the `start` field and is used in conjuction to restrict the range of the returned results.  If the provided value extends beyond the `max` field, the `max` field takes precedence.

* `max`: Determines the max amount of results to return from the database.  Defaults to `50` if not provided.

* `order`: Determines the order in which the results are sorted has to be either 'asc' or 'desc'.  Defaults to `asc` if not provided.

### Example of Valid Ranges
```
/apps?range={"by":"id"}
/apps?range={"by":"id","start":1}
/apps?range={"by":"id","start":5}
/apps?range={"by":"id","start":1,"end":5}
/apps?range={"by":"id","start":1,"max":5}
/apps?range={"by":"id","start":1,"order":"desc"}
/apps?range={"by":"id","start":5,"end":10,"max":10,"order":"asc"}
/apps?range={"by":"name","start":"my-app-001","end":"my-app-050","max":10,"order":"asc"}

```

## Integrated Testing
Integrated testing is implemented for this project.  The testcases are written using the Jest testing framework and is automatically performed on CircleCi with each new build.

## Challenges
The biggest challenges and the most enjoyable experiences of the whole project all had to do with learning about automated testing and the basics of how to work with Jest and CircleCi.  I started from basic tutorials dealing with unit testing and eventually scaled up to learning about integration testing and how to work with both Jest and CircleCi during the process.

## Afterthoughts
Most of the APIs I've used in the past accepted a range of optional parameters by attaching queries to the end of the url: (e.g. `/endpoint?skip=100&limit=500&sortby=ascending`) so it was interesting to try to implement this API endpoint using a JSON object in the url.
