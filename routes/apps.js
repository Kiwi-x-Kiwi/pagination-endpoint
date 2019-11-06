const express = require('express');
const router = express.Router();
const App = require('../models/App')

function getRangeByID(arr, start, end, max){
  const range = [];
  let i = 0;
  arr = arr.sort(sortHelper('id'));
  start = Math.max(0, start) || 0;
  end = Math.min(end, Number.MAX_SAFE_INTEGER) || Number.MAX_SAFE_INTEGER;

  while (i < arr.length && range.length < max && arr[i].id <= end){
    if(arr[i].id >= start) range.push(arr[i])
    i++;
  }

  return range;
}

function getRangeByName(arr, start, end, max){  
  const nameRegex = /my-app-(\d){3,}/;
  const range = [];
  let i = 0;
  arr = arr.sort(sortHelper('name'));
  if(start){
    if(!nameRegex.test(start)) return [];
    else start = +start.match(/\d+/)[0]
  }else start = 0;
  if(end){
    if(!nameRegex.test(end)) end = Number.MAX_SAFE_INTEGER;
    else end = +end.match(/\d+/)[0]
  }else end = Number.MAX_SAFE_INTEGER;
  
  console.log(start, end)

  while (i < arr.length && range.length < max) {
    let id = +arr[i].name.match(/\d+/)[0];
    if(id > end) break;
    else if (id >= start) range.push(arr[i]);
    i++;
  }

  return range;
}

function sortHelper(sortBy) {
  return function (a, b) {
    return a[sortBy] - b[sortBy]
  }
}

/* GET home page */
router.get('/', async (req, res, next) => {
  const DEFAULT_SIZE = 50;
  let apps = await App.find().select('-_id -__v')

  if (req.query.range) {
    let range = JSON.parse(req.query.range)
    let { by, start, end, max, order } = range;

    if (order && (order != 'asc' && order != 'desc')) return res.status(400).send('undefined');
    else order = order || 'asc';
    if (max && !Number.isInteger(max)) return res.status(400).send('undefined');
    else max = Math.min(max, DEFAULT_SIZE) || DEFAULT_SIZE;

    switch (by) {
      case 'id':
        if (start && (!Number.isInteger(start) || start < 0)) return res.status(400).send('undefined');
        else if (end && (!start || !Number.isInteger(end))) return res.status(400).send('undefined');
        apps = getRangeByID(apps, start, end, max);
        break;

      case 'name':
        if (start && Number.isInteger(start)) return res.status(400).send('undefined');
        else if (end && (!start || Number.isInteger(end))) return res.status(400).send('undefined');
        apps = getRangeByName(apps, start, end, max);
        break;

      default:
        return res.status(400).send('undefined')
    }

    if(order == 'desc') apps = apps.reverse();

  } else apps = apps.sort(sortHelper('id')).slice(0, DEFAULT_SIZE)

  res.json(apps);
});

module.exports = router;
