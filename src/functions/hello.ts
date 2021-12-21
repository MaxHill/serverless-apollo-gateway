import { ApolloServer, gql } from 'apollo-server-lambda';
import { buildSubgraphSchema } from '@apollo/subgraph';
import schema from './hello.graphql';

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  ${schema}
`;

// Provide resolver functions for your schema fields
const resolvers = { Query: { hello: () => 'Hello world!' } };

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }])
});

export const handler = server.createHandler();
