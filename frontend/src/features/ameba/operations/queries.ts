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
  query AllCostItemsQuery($departments: [ID]) {
    allCostItems(departments: $departments) {
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
  query AllSalesCategoriesQuery($departments: [ID]) {
    allSalesCategories(departments: $departments) {
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
  query AllEmployeeQuery($departments: [ID]) {
    allEmployees(departments: $departments) {
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
        id
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
        id
        name
      }
    }
    salesByItemAggregation(
      dateAfter: $dateAfter
      dateBefore: $dateBefore
      department: $department
    ) {
      num
      money
      item {
        id
        name
        photo
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

export const GET_ALL_AGGREGATIONS_BY_DAY = gql`
  query allAggregationsByDay(
    $delta: Int!
    $isMonth: Boolean
    $date: Date!
    $department: ID!
  ) {
    allAggregationsByDay(
      delta: $delta
      isMonth: $isMonth
      date: $date
      department: $department
    ) {
      profitPerHour
      totalCost
      totalSalesMoney
      totalHours
      date
    }
  }
`;

export const GET_COST_AGGREGATIONS_BY_DAY = gql`
  query costAggregationsByDay(
    $delta: Int!
    $isMonth: Boolean
    $date: Date!
    $department: ID!
  ) {
    costAggregationsByDay(
      delta: $delta
      isMonth: $isMonth
      date: $date
      department: $department
    ) {
      date
      aggregation {
        money
        item {
          id
          name
        }
      }
    }
  }
`;
export const GET_SALES_BY_ITEM_AGGREGATIONS_BY_DAY = gql`
  query salesByItemAggregationsByDay(
    $delta: Int!
    $date: Date!
    $department: ID!
    $isMonth: Boolean
  ) {
    salesByItemAggregationsByDay(
      delta: $delta
      date: $date
      department: $department
      isMonth: $isMonth
    ) {
      date
      aggregation {
        money
        num
        item {
          id
          name
        }
      }
    }
  }
`;

export const GET_SALES_BY_CATEGORY_AGGREGATIONS_BY_DAY = gql`
  query salesByCategoryAggregationsByDay(
    $delta: Int!
    $date: Date!
    $department: ID!
    $isMonth: Boolean
  ) {
    salesByCategoryAggregationsByDay(
      delta: $delta
      date: $date
      department: $department
      isMonth: $isMonth
    ) {
      date
      aggregation {
        money
        category {
          id
          name
        }
      }
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
            id
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
            id
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
            id
            name
          }
        }
      }
    }
    allWorkingHours(
      date_Lte: $dateBefore
      date_Gte: $dateAfter
      department: $department
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
      }
      department {
        id
      }
    }
  }
`;

export const GET_SINGLE_EMPLOYEE = gql`
  query getSingleEmployee($id: ID!) {
    employee(id: $id) {
      id
      lastName
      firstName
      furiganaLastName
      furiganaFirstName
      photo
      position
      payment
      departments {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

export const GET_SINGLE_DEPARTMENT = gql`
  query getSingleDepartment($id: ID!) {
    department(id: $id) {
      id
      name
    }
  }
`;

export const GET_SINGLE_SALES_UNIT = gql`
  query getSingleSalesUnit($id: ID!) {
    salesUnit(id: $id) {
      id
      name
      photo
      unitPrice
      category {
        id
      }
      departments {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;
export const GET_SINGLE_SALES_CATEGORY = gql`
  query getSingleSalesCategory($id: ID!) {
    salesCategory(id: $id) {
      id
      name
      departments {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

export const GET_SINGLE_COST_ITEM = gql`
  query getSingleCostItem($id: ID!) {
    costItem(id: $id) {
      name
      id
      departments {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

export const GET_TABLE_DATA = gql`
  query Table($date: Date, $department: ID, $isMonth: Boolean) {
    table(date: $date, department: $department, isMonth: $isMonth) {
      name
      theDay
      theDayBefore
      oneWeekBefore
      theMonth
      theMonthBefore
      twoMonthsBefore
      detail {
        name
        theDay
        theDayBefore
        oneWeekBefore
        theMonth
        theMonthBefore
        twoMonthsBefore
      }
    }
  }
`;
