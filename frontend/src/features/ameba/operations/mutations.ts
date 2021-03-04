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

export const CREATE_SALES_BY_ITEM = gql`
  mutation CreateSalesByItemMutation(
    $date: Date!
    $department: ID!
    $item: ID!
    $num: String!
  ) {
    createSalesByItem(
      input: { date: $date, department: $department, item: $item, num: $num }
    ) {
      salesByItem {
        id
      }
    }
  }
`;

export const CREATE_SALES_BY_CATEGORY = gql`
  mutation CreateSalesByCategoryMutation(
    $date: Date!
    $department: ID!
    $category: ID!
    $money: String!
  ) {
    createSalesByCategory(
      input: {
        date: $date
        department: $department
        category: $category
        money: $money
      }
    ) {
      salesByCategory {
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

export const UPDATE_COST = gql`
  mutation UdateCostMutation(
    $id: ID!
    $date: Date
    $department: ID
    $item: ID
    $money: String
  ) {
    updateCost(
      input: {
        id: $id
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

export const UPDATE_SALES_BY_ITEM = gql`
  mutation UpdateSalesByItemMutation(
    $id: ID!
    $date: Date
    $department: ID
    $item: ID
    $num: String
  ) {
    updateSalesByItem(
      input: {
        id: $id
        date: $date
        department: $department
        item: $item
        num: $num
      }
    ) {
      salesByItem {
        id
      }
    }
  }
`;

export const UPDATE_SALES_BY_CATEGORY = gql`
  mutation UpdateSalesByCategoryMutation(
    $id: ID!
    $date: Date
    $department: ID
    $category: ID
    $money: String
  ) {
    updateSalesByCategory(
      input: {
        id: $id
        date: $date
        department: $department
        category: $category
        money: $money
      }
    ) {
      salesByCategory {
        id
      }
    }
  }
`;

export const UPDATE_WORKING_HOURS = gql`
  mutation UpdateWorkingHoursMutation(
    $id: ID!
    $date: Date
    $employee: ID
    $hours: String
  ) {
    updateWorkingHours(
      input: { id: $id, date: $date, employee: $employee, hours: $hours }
    ) {
      workingHours {
        id
      }
    }
  }
`;

export const DELETE_COST = gql`
  mutation DeleteCostMutation($id: ID!) {
    deleteCost(input: { id: $id }) {
      cost {
        id
      }
    }
  }
`;

export const DELETE_SALES_BY_ITEM = gql`
  mutation DeleteSalesByItemMutation($id: ID!) {
    deleteSalesByItem(input: { id: $id }) {
      salesByItem {
        id
      }
    }
  }
`;
export const DELETE_SALES_BY_CATEGORY = gql`
  mutation DeleteSalesByCategoryMutation($id: ID!) {
    deleteSalesByCategory(input: { id: $id }) {
      salesByCategory {
        id
      }
    }
  }
`;
export const DELETE_WORKING_HOURS = gql`
  mutation DeleteWorkingHoursMutation($id: ID!) {
    deleteWorkingHours(input: { id: $id }) {
      workingHours {
        id
      }
    }
  }
`;
