const fs = require("fs");
const { ApolloServer, gql } = require("apollo-server-lambda");
const AWS = require("aws-sdk");
const { v4 } = require('uuid')

// get the GraphQL schema
const schema = fs.readFileSync("./src/schema.graphql", "utf8");

// resolver functions
const resolvers = {
  Query: {
    item: async (_, { id }) => {
      const dynamoDb = new AWS.DynamoDB.DocumentClient();

      const params = {
        TableName: process.env.ITEM_TABLE,
        Key: {
          itemId: id,
        },
      };

      const { Item } = await dynamoDb.get(params).promise();

      return {
        ...Item,
        id: Item.itemId,
      };
    },
  },
  Mutation: {
    createItem: async (_,{content}) => {
        const dynamoDb = new AWS.DynamoDB.DocumentClient()
        const id = v4()
      
        const params = {
          TableName: process.env.ITEM_TABLE,
          Item: {
            itemId: id,
            content,
          },
        }
      
        await dynamoDb.put(params).promise()
      
        return {
          content,
          id,
        }
    },
  },
};

const server = new ApolloServer({ typeDefs: schema, resolvers });

exports.handler = server.createHandler();
