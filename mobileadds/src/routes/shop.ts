/* eslint-disable prettier/prettier */
import { ApolloServer } from '@apollo/server';
import axios from 'axios';

type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
};
type Query {
    getProducts: [Product!]!
  }
;