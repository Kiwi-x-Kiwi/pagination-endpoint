process.env.MONGODB_TEST = 'mongodb://localhost/test';
const request  = require('supertest');
const app      = require('../app');
const mongoose = require('mongoose')

function checkSorted(arr, order = 'asc'){
  if(order === 'desc') arr.reverse();
  let prevID = arr[0].id;

  for(let i = 1; i < arr.length; i++){
    if(prevID > arr[i].id) return false;
  }

  return true;
}

beforeAll(() =>{
  require('../bin/seed');
})

afterAll(() =>{
  mongoose.disconnect();
})

describe('GET /apps with no range query', () =>{
  test('It should responds with an Array of JSON objects', async (done) =>{
    const response = await request(app).get('/apps');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    done();
  })
  test('The returned array should have a size limit of 50', async (done) =>{
    const response = await request(app).get('/apps');
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(50);
    done();
  }, 10000)
  test('The returned array should begin with the first entry', async (done) =>{
    const response = await request(app).get('/apps');
    expect(response.statusCode).toBe(200);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    done();
  })
  test('The returned array should be sorted in ascending order', async (done) =>{
    const response = await request(app).get('/apps');
    expect(response.statusCode).toBe(200);
    expect(checkSorted(response.body)).toBe(true);
    done();
  })
},10000)  

describe('GET /apps with range query but no "by" field', () =>{
  test('It should respond with status code 400 when "by" is missing from "range"', async (done) =>{
    const response = await request(app).get('/apps?range={"by":""}');
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({});
    done();
  })
})

describe('GET /apps with range query and "by = id"', () => {
  test('It should respond with a sorted JSON Array starting with the 1st object when "by = id"', async (done) =>{
    const response = await request(app).get('/apps?range={"by":"id"}');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(50);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with a sorted JSON Array of objects beginning with "start" up to "max" entries', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":1}');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(50);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with a sorted JSON Array of objects beginning with "start" up to "max" entries', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":5}');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(50);
    expect(response.body[0]).toEqual({
      id: 5,
      name: 'my-app-005'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with a sorted JSON Array within the range of "start" and "end" if both are provided', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":1,"end":5}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(5);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 5,
      name: 'my-app-005'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with a sorted JSON Array within the range of "start" and "end" only up to the "max" amount if "end" extends beyond the  "max" field', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":5,"end":60,"max":10}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(10);
    expect(response.body[0]).toEqual({
      id: 5,
      name: 'my-app-005'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 14,
      name: 'my-app-014'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with a sorted JSON Array within the range of "start" and "end" only up to the "max" amount if "end" extends beyond the  "max" field', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":900,"end":950}');
    const lastIndex = response.body.length - 1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(50);
    expect(response.body[0]).toEqual({
      id: 900,
      name: 'my-app-900'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 949,
      name: 'my-app-949'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with JSON Array starting at the "start" index and returns up to "max" objects', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":1,"max":5}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(5);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 5,
      name: 'my-app-005'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with JSON Array in a descending order if "order = desc"', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":1,"order":"desc"}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(50);
    expect(response.body[0]).toEqual({
      id: 50,
      name: 'my-app-050'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    expect(checkSorted(response.body, 'desc')).toBe(true);
    done();
  }, 10000)
  test('It should respond with JSON Array in a descending order if "order = desc"', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":900,"end":910,"order":"desc"}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(50);
    expect(response.body[0]).toEqual({
      id: 910,
      name: 'my-app-910'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 900,
      name: 'my-app-900'
    });
    expect(checkSorted(response.body, 'desc')).toBe(true);
    done();
  }, 10000)
  test('It should respond with an empty JSON Array if there are no number matching the range criteria"', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":1000,"end":1001,"order":"desc"}');
    const lastIndex = response.body.length - 1;
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
    done();
  })
  test('It should respond with an empty JSON Array if there are no number matching the range criteria"', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":9990,"max":4,"order":"desc"}');
    const lastIndex = response.body.length - 1;
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
    done();
  })
})  

describe('GET /apps with range query and "by = name"', () => {
  test('It should respond with a sorted JSON Array starting with the 1st object when "by = name"', async (done) =>{
    const response = await request(app).get('/apps?range={"by":"name"}');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(50);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with a sorted JSON Array of objects beginning with "start" up to "max" entries', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","start":"my-app-001"}');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(50);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with a sorted JSON Array of objects beginning with "start" up to "max" entries', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","start":"my-app-005"}');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(50);
    expect(response.body[0]).toEqual({
      id: 5,
      name: 'my-app-005'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with a sorted JSON Array within the range of "start" and "end" if both are provided', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","start":"my-app-001","end":"my-app-005"}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(5);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 5,
      name: 'my-app-005'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with a sorted JSON Array within the range of "start" and "end" only up to the "max" amount if "end" extends beyond the  "max" field', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","start":"my-app-005","end":"my-app-060","max":10}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(10);
    expect(response.body[0]).toEqual({
      id: 5,
      name: 'my-app-005'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 14,
      name: 'my-app-014'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with a sorted JSON Array within the range of "start" and "end" only up to the "max" amount if "end" extends beyond the  "max" field', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","start":"my-app-900","end":"my-app-950"}');
    const lastIndex = response.body.length - 1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(50);
    expect(response.body[0]).toEqual({
      id: 900,
      name: 'my-app-900'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 949,
      name: 'my-app-949'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with JSON Array starting at the "start" index and returns up to "max" objects', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","start":"my-app-001","max":5}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(5);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 5,
      name: 'my-app-005'
    });
    expect(checkSorted(response.body)).toBe(true);
    done();
  }, 10000)
  test('It should respond with JSON Array in a descending order if "order = desc"', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","start":"my-app-001","order":"desc"}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(50);
    expect(response.body[0]).toEqual({
      id: 50,
      name: 'my-app-050'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    expect(checkSorted(response.body, 'desc')).toBe(true);
    done();
  }, 10000)
  test('It should respond with JSON Array in a descending order if "order = desc"', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","start":"my-app-900","end":"my-app-910","order":"desc"}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(50);
    expect(response.body[0]).toEqual({
      id: 910,
      name: 'my-app-910'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 900,
      name: 'my-app-900'
    });
    expect(checkSorted(response.body, 'desc')).toBe(true);
    done();
  }, 10000)
  test('It should respond with an empty JSON Array if there are no number matching the range criteria"', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","start":"my-app-1000","end":"my-app-1001","order":"desc"}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
    done();
  })
  test('It should respond with an empty JSON Array if there are no number matching the range criteria"', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","start":"my-app-9990","max":4,"order":"desc"}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
    done();
  })
})  

describe('GET /apps with additional corner cases that should return status code 400 and undefined', () => {
  test('It should respond with status code 400 when "by = id" and "start" is not a number', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":"NaN"}');
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({});
    done();
  })
  test('It should respond with status code 400 when "by = id" and "end" is not a number', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":1,"end":"NaN"}');
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({});
    done();
  })
  test('It should respond with status code 400 when "by = name" and "start" is not a string', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","start":1}');
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({});
    done();
  })
  test('It should respond with status code 400 when "by = name" and "end" is not a string', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":"my-app-001","end":2}');
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({});
    done();
  })
  test('It should respond with status code 400 when "order" is not a "asc" or "desc"', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","order":1}');
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({});
    done();
  })
  test('It should respond with status code 400 when "max" is not a number', async (done) => {
    const response = await request(app).get('/apps?range={"by":"name","max":"NaN"}');
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({});
    done();
  })
})
