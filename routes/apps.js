const express = require('express');
const router = express.Router();
const App = require('../models/App')

function sortHelper(sortBy) {
  return function(a, b){
    return a[sortBy] - b[sortBy]
  }
}

/* GET home page */
router.get('/', async (req, res, next) => {
  const DEFAULT_SIZE = 50;
  let apps = await App.find().select('-_id -__v')

  if(req.query.range){
    let range = JSON.parse(req.query.range)
    let {by, start, end, max, order} = range;

    if(!by){
      res.render('parameter-error', {by})
      return;
    }else if(by !== 'name' && by !== 'id'){
      res.render('parameter-error', {by})
      return;
    }

    start = Math.max(start, 1) || 1;
    max = max ? Math.min(max, DEFAULT_SIZE) : DEFAULT_SIZE;
    end = Math.min(end, start + max -1) || start + max -1;
    order = order || 'asc';

    if(order === 'asc'){
      apps = apps.sort(sortHelper(by)).slice(start - 1, end)
    }else apps = apps.sort(sortHelper(by)).reverse().slice(start - 1, end);
    
  }else apps = apps.slice(0, DEFAULT_SIZE)

  res.json(apps);
});

module.exports = router;
