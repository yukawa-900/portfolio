import gql from "graphql-tag";

export const CREATE_COST = gql`
  mutation CreateCostMutation(
    $date: Date!
    $department: ID!
    $item: ID!
    $money: String!
  ) {
    createCost(
      input: {
        date: $date
        department: $department
        item: $item
        money: $money
      }
    ) {
      cost {
        id
      }
    }
  }
`;

export const CREATE_SALES_BY_NUM = gql`
  mutation CreateSalesMutation(
    $date: Date!
    $department: ID!
    $item: ID
    $num: String
  ) {
    createSales(
      input: { date: $date, department: $department, item: $item, num: $num }
    ) {
      sales {
        id
      }
    }
  }
`;

export const CREATE_WORKING_HOURS = gql`
  mutation CreateWorkingHoursMutation(
    $date: Date!
    $employee: ID!
    $hours: String!
  ) {
    createWorkingHours(
      input: { date: $date, employee: $employee, hours: $hours }
    ) {
      workingHours {
        id
      }
    }
  }
`;
