import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

// GET text
// GET hello

let tweets = [
  {
    id: "1",
    text: "Hello",
    userId: "2",
  },
  {
    id: "2",
    text: "World",
    userId: "1",
  },
];

let users = [
  {
    id: "1",
    firstName: "Yunhang",
    lastName: "Yu",
  },
  {
    id: "2",
    firstName: "John",
    lastName: "Doe",
  },
];

// SDL (Schema Definition Language)
const typeDefs = gql`
  """
  User object
  """
  type User {
    id: ID!
    firstName: String!
    lastName: String
    """
    Is the sum of the firstName and lastName
    """
    fullName: String!
  }

  """
  Tweet object has author field
  """
  type Tweet {
    id: ID!
    text: String!
    author: User!
  }
  # GET /api/v1/tweets
  # GET /api/v1/tweets/:id
  type Query {
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    allMovies: [Movie!]!
    movie(id: ID!): Movie
  }
  # POST /api/v1/tweets
  # DELETE /api/v1/tweets/:id
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet

    """
    Delete a tweet by id
    """
    deleteTweet(id: ID!): Boolean
  }

  type Movie {
    id: ID!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Int!
    genres: [String!]!
    summary: String
    description_full: String
    synopsis: String
    yt_trailer_code: String
    language: String
    mpa_rating: String
    background_image: String
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }
`;

const resolvers = {
  Query: {
    allTweets: () => tweets,
    tweet: (root, { id }) => {
      return tweets.find((tweet) => tweet.id === id);
    },
    allUsers: () => users,
    allMovies: () => {
      return fetch("https://yts.mx/api/v2/list_movies.json")
        .then((res) => res.json())
        .then((json) => json.data.movies);
    },
    movie: (_, { id }) => {
      return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
        .then((res) => res.json())
        .then((json) => json.data.movie);
    },
  },
  Mutation: {
    postTweet: (_, { text, userId }) => {
      if (!users.find((user) => user.id === userId)) return null;

      const newTweet = {
        id: tweets.length + 1,
        text,
        userId,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet: (_, { id }) => {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    fullName: ({ firstName, lastName }) => `${firstName} ${lastName}`,
  },
  Tweet: {
    author: ({ userId }) => users.find((user) => user.id === userId),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at: ${url}`);
});
