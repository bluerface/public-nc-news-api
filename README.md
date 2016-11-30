## Northcoders News API

### Background

We will be building the API which we used in the Northcoders News Sprint during the
Front End block of the course. Your mongoose models and a Database seed file have been done for you. 

### Tasks

1. Seed your database with the main seed file `$ node seed/seed.js`
2. Build your express App
3. Mount an API Router onto your app
4. Define the routes described below
5. Define controller functions for each of your routes
6. Test your api! (Day two)

### Routes
```
GET /api/topics
```
Get all the topics

```
GET /api/topics/:topic_id/articles
```
Return all the articles for a certain topic

```
GET /api/articles
```
Returns all the articles

```
GET /api/articles/:article_id/comments
```
Get all the comments for a individual article

```
POST /api/articles/:article_id/comments
```
Add a new comment to an article. This route requires a JSON body with a comment key and value pair
e.g: {"comment": "This is my new comment"}

```
PUT /api/articles/:article_id
```
Increment or Decrement the votes of an article by one. This route requires a vote query of 'up' or 'down'
e.g: /api/articles/:article_id?vote=up

```
PUT /api/comments/:comment_id
```
Increment or Decrement the votes of a comment by one. This route requires a vote query of 'up' or 'down'
e.g: /api/comments/:comment_id?vote=down

```
DELETE /api/comments/:comment_id
```
Deletes a comment

```
GET /api/users/:username
```
Returns a JSON object with the profile data for the specified user.