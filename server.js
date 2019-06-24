let express = require('express');
let graphqlHTTP = require('express-graphql');
let { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
let schema = buildSchema(`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  type Query {
    quoteOfTheDay: String
    songOfTheDay: String
    random: Float!
    getDie(numSides: Int): RandomDie
    getMessage(id: ID!): Message
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    update(id: ID!, input: MessageInput): Message
  }
`);

// If Message had any complex fields, we'd put them on this object
class Message {
  constructor(id, {content, author}) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

// This class implements the RandomDie GraphQL type
class RandomDie {
  constructor(numSides) {
    this.numSides = numSides;
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({numRolls}) {
    let output = [];
    for (let i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
}

// Maps username to content
let fakeDatabase = {};

// The root provides the top-level API endpoints
let root = {
  getMessage: function ({id}) {
    if (!fakeDatabase[id]) {
      throw new Error('No message exists with id: ' + id);
    }
    return new Message(id, fakeDatabase[id]);
  },
  createMessage: function ({input}) {
    let randomId = require('crypto').randomBytes(10).toString('hex');
    fakeDatabase[randomId] = input;
    return new Message(randomId, input);
  },
  updateMessage: function ({id, input}) {
    if (!fakeDatabase[id]) {
      throw new Error ('No message exists with id: ' + id);
      // This replaces all old data, but some apps might want a partial update.
      fakeDatabase[id] = input;
      return new Message(id, input);
    }
  },
  quoteOfTheDay: () => {
    return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
  },
  songOfTheDay: () => {
    return Math.random() < 0.5 ? 'Giovanni' : "Stellar"
  },
  random: () => {
    return Math.random();
  },
  getDie: function ({numSides}) {
    return new RandomDie(numSides || 6);
  }
};

let app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');

/*     *CALLS FOR GRAPHQL INTERFACE*
{
  songOfTheDay
  quoteOfTheDay
  random
  getDie(numSides: 6) {
    rollOnce
    roll(numRolls: 3)
  }
}

mutation {
  createMessage(input: {
    author: "andy",
    content: "hope is a good thing"
  }) {
    id
  }
}

      *THIS CAN BE LOGGED IN CONSOLE*
let dice = 3;
let sides = 6;
let query = `query RollDice($dice: Int!, $sides: Int) {
  rollDice(numDice: $dice, numSides: $sides)
}`;

fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables: { dice, sides },
  })
})
  .then(r => r.json())
  .then(data => console.log('data returned:', data));
*/