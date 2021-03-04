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

export const GET_ALL_SALES_CATEGORIES = gql`
  query AllSalesCategoriesQuery {
    allSalesCategories {
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
          fullName
          fullFurigana
          position
          photo
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
          photo
        }
      }
    }
  }
`;

export const GET_AGGREGATIONS = gql`
  query getAggregations(
    $dateAfter: Date!
    $dateBefore: Date!
    $department: ID!
  ) {
    costAggregation(
      dateAfter: $dateAfter
      dateBefore: $dateBefore
      department: $department
    ) {
      money
      item {
        name
      }
    }

    salesByItemAggregation(
      dateAfter: $dateAfter
      dateBefore: $dateBefore
      department: $department
    ) {
      money
      item {
        name
      }
    }
    salesByCategoryAggregation(
      dateAfter: $dateAfter
      dateBefore: $dateBefore
      department: $department
    ) {
      money
      category {
        name
      }
    }
    workingHoursAggregation(
      dateAfter: $dateAfter
      dateBefore: $dateBefore
      department: $department
    ) {
      hours
      position
    }
  }
`;

export const GET_PROFIT_PEH_HOUR_BY_DAY = gql`
  query ProfitPerHourByDay($days: Int!, $date: String!, $department: ID!) {
    profitPerHourByDay(days: $days, date: $date, department: $department) {
      profitPerHour
      date
    }
  }
`;

export const GET_INPUT_DATA = gql`
  query getInputData($dateBefore: Date, $dateAfter: Date, $department: ID) {
    allCost(
      date_Lte: $dateBefore
      date_Gte: $dateAfter
      department: $department
    ) {
      edges {
        node {
          id
          date
          money
          item {
            name
          }
        }
      }
    }
    allSalesByItem(
      date_Lte: $dateBefore
      date_Gte: $dateAfter
      department: $department
    ) {
      edges {
        node {
          id
          date
          money
          num
          item {
            name
            unitPrice
          }
        }
      }
    }
    allSalesByCategory(
      date_Lte: $dateBefore
      date_Gte: $dateAfter
      department: $department
    ) {
      edges {
        node {
          id
          date
          money
          category {
            name
          }
        }
      }
    }
    allWorkingHours(
      date_Lte: $dateBefore
      date_Gte: $dateAfter
      employee_Department: $department
    ) {
      edges {
        node {
          id
          date
          hours
          employee {
            fullName
            position
          }
        }
      }
    }
  }
`;

export const GET_SINGLE_COST = gql`
  query getSingleCost($id: ID!) {
    cost(id: $id) {
      id
      date
      item {
        id
      }
      money
      department {
        id
      }
    }
  }
`;

export const GET_SINGLE_SALES_BY_ITEM = gql`
  query getSingleSalesByItem($id: ID!) {
    salesByItem(id: $id) {
      id
      date
      item {
        id
      }
      num
      department {
        id
      }
    }
  }
`;

export const GET_SINGLE_SALES_BY_CATEGORY = gql`
  query getSingleSalesByCategory($id: ID!) {
    salesByCategory(id: $id) {
      id
      date
      category {
        id
      }
      money
      department {
        id
      }
    }
  }
`;

export const GET_SINGLE_WORKING_HOURS = gql`
  query getSingleWorkingHours($id: ID!) {
    workingHours(id: $id) {
      id
      date
      hours
      employee {
        id
        department {
          id
        }
      }
    }
  }
`;
