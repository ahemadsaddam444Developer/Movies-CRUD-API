const express = require('express')
const app = express()
app.use(express.json())

const {
    open
} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

// Initialize DB and Server
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        })
        app.listen(3000, () => {
            console.log('Server running at http://localhost:3000/')
        })
    } catch (error) {
        console.log(`DB Error: ${error.message}`)
        process.exit(1)
    }
}

initializeDBAndServer()

// API 1: Get all movie names
app.get('/movies/', async (request, response) => {
    const getMoviesQuery = `
    SELECT movie_name AS movieName FROM movie;
  `
    const moviesArray = await db.all(getMoviesQuery)
    response.send(moviesArray)
})

// API 2: Add a new movie
app.post('/movies/', async (request, response) => {
    const {
        directorId,
        movieName,
        leadActor
    } = request.body
    const addMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES (?, ?, ?);
  `
    await db.run(addMovieQuery, [directorId, movieName, leadActor])
    response.send('Movie Successfully Added')
})

// API 3: Get movie by ID
app.get('/movies/:movieId/', async (request, response) => {
    const {
        movieId
    } = request.params
    const getMovieQuery = `
    SELECT 
      movie_id AS movieId,
      director_id AS directorId,
      movie_name AS movieName,
      lead_actor AS leadActor
    FROM movie
    WHERE movie_id = ?;
  `
    const movie = await db.get(getMovieQuery, [movieId])
    response.send(movie)
})

// API 4: Update movie details
app.put('/movies/:movieId/', async (request, response) => {
    const {
        movieId
    } = request.params
    const {
        directorId,
        movieName,
        leadActor
    } = request.body
    const updateMovieQuery = `
    UPDATE movie
    SET 
      director_id = ?,
      movie_name = ?,
      lead_actor = ?
    WHERE movie_id = ?;
  `
    await db.run(updateMovieQuery, [directorId, movieName, leadActor, movieId])
    response.send('Movie Details Updated')
})

// API 5: Delete movie
app.delete('/movies/:movieId/', async (request, response) => {
    const {
        movieId
    } = request.params
    const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ?;
  `
    await db.run(deleteMovieQuery, [movieId])
    response.send('Movie Removed')
})

// API 6: Get all directors
app.get('/directors/', async (request, response) => {
    const getDirectorsQuery = `
    SELECT 
      director_id AS directorId, 
      director_name AS directorName 
    FROM director;
  `
    const directorsArray = await db.all(getDirectorsQuery)
    response.send(directorsArray)
})

// API 7: Get all movies by a director
app.get('/directors/:directorId/movies/', async (request, response) => {
    const {
        directorId
    } = request.params
    const getMoviesQuery = `
    SELECT movie_name AS movieName 
    FROM movie 
    WHERE director_id = ?;
  `
    const moviesList = await db.all(getMoviesQuery, [directorId])
    response.send(moviesList)
})

// ✅ Default export (Important for tests)
module.exports = app
