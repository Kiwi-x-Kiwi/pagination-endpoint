process.env.MONGODB_TEST = 'mongodb://localhost/test';
const request  = require('supertest');
const app      = require('../app');
const mongoose = require('mongoose')

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
  test('The returned array should have a size limit of 50 by default', async (done) =>{
    const response = await request(app).get('/apps');
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeLessThanOrEqual(50);
    done();
  }, 7000)
  test('The returned array should begin with the first entry', async (done) =>{
    const response = await request(app).get('/apps');
    expect(response.statusCode).toBe(200);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    done();
  })
},)  

describe('GET /apps with range query', () =>{
  // Testing 'by' field of 'range'.
  test('It should respond with status code 400 when "by" is missing from "range"', async (done) =>{
    const response = await request(app).get('/apps?range={"by":""}');
    console.log(response)
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({});
    done();
  })
  test('It should respond with JSON Array when by = id', async (done) =>{
    const response = await request(app).get('/apps?range={"by":"id"}');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(50);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    done();
  })
  test('It should respond with JSON Array when by = name', async (done) =>{
    const response = await request(app).get('/apps?range={"by":"name"}');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(50);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    done();
  })

  // Testing the 'start' and 'end' fields of 'range'
  test('It should respond with JSON Array starting at the "start" index and return up to "max" objects', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":1}');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(50);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    done();
  })
  test('It should respond with JSON Array starting at the "start" index and ending at the "end" index if end < start + max', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":1,"end":5}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(50);
    expect(response.body[0]).toEqual({
      id: 1,
      name: 'my-app-001'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 5,
      name: 'my-app-005'
    });
    done();
  })
  test('It should respond with JSON Array starting at the "start" index and ending at start + max index if end > start + max ', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":900,"end":950}');
    const lastIndex = response.body.length - 1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(50);
    expect(response.body[0]).toEqual({
      id: 900,
      name: 'my-app-900'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 949,
      name: 'my-app-949'
    });
    done();
  })

  // Testing the 'max' field of 'range'
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
    done();
  })

  // Testing the 'order' field of 'range'
  test('It should respond with JSON Array in a descending order', async (done) => {
    const response = await request(app).get('/apps?range={"by":"id","start":1,"order":"desc"}');
    const lastIndex = response.body.length -1;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(50);
    expect(response.body[0]).toEqual({
      id: 999,
      name: 'my-app-999'
    });
    expect(response.body[lastIndex]).toEqual({
      id: 950,
      name: 'my-app-950'
    });
    done();
  })


})  