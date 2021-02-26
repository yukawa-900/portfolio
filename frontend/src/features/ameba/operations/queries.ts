import gql from "graphql-tag";

// GET_DEPARTMENTS (no filter)

export const GET_ALL_AMEBA_DEPARTMENTS = gql`
  query AllDeptQuery {
    allDepartments {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const GET_ALL_COST_ITEMS = gql`
  query AllCostItemsQuery {
    allCostItems {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const GET_ALL_EMPLOYEES = gql`
  query AllEmployeeQuery($department: ID) {
    allEmployees(department: $department) {
      edges {
        node {
          id
          name
          position
        }
      }
    }
  }
`;

export const GET_ALL_SALES_UNITS = gql`
  query AllSalesUnits($departments: [ID]) {
    allSalesUnits(departments: $departments) {
      edges {
        node {
          id
          name
          unitPrice
        }
      }
    }
  }
`;
