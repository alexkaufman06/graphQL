# GraphQL Tutorial
This is an example of implementing Express and GraphQL based on the GraphQL JS tutorial.
## Setup Instructions:

Clone and cd into repository
```
npm install
node server.js
```
Navigate to: http://localhost:4000/graphql 

This opens up a GraphQL service that we can send queries to validate and execute like the two examples below:

```
{
  songOfTheDay
  quoteOfTheDay
  random
  getDie(numSides: 6) {
    rollOnce
    roll(numRolls: 3)
  }
}
```
```
mutation {
  createMessage(input: {
    author: "andy",
    content: "hope is a good thing"
  }) {
    id
  }
}
```
You can also execute queries in the JS console of the browser:
```
var author = 'andy';
var content = 'hope is a good thing';
var query = `mutation CreateMessage($input: MessageInput) {
  createMessage(input: $input) {
    id
  }
}`;

fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables: {
      input: {
        author,
        content,
      }
    }
  })
})
  .then(r => r.json())
  .then(data => console.log('data returned:', data));
```

