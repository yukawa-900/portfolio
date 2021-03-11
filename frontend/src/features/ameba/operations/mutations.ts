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
    $date: Date!
    $department: ID!
    $item: ID!
    $money: String!
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
    $date: Date!
    $department: ID!
    $item: ID!
    $num: String!
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
    $date: Date!
    $department: ID!
    $category: ID!
    $money: String!
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
    $date: Date!
    $employee: ID!
    $hours: String!
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

export const UPDATE_DEPARTMENT = gql`
  mutation UpdateDepartmentMutation($id: ID!, $name: String!) {
    updateDept(input: { id: $id, name: $name }) {
      department {
        id
      }
    }
  }
`;

export const UPDATE_SALES_CATEGORY = gql`
  mutation UpdateSalesCategoryMutation($id: ID!, $name: String!) {
    updateSalesCategory(input: { id: $id, name: $name }) {
      salesCategory {
        id
      }
    }
  }
`;

export const UPDATE_COST_ITEM = gql`
  mutation UpdateCostItemMutation($id: ID!, $name: String!) {
    updateCostItem(input: { id: $id, name: $name }) {
      costItem {
        id
      }
    }
  }
`;

export const CREATE_DEPARTMENT = gql`
  mutation CreateDepartmentMutation($name: String!) {
    createDept(input: { name: $name }) {
      department {
        id
      }
    }
  }
`;

export const CREATE_SALES_CATEGORY = gql`
  mutation CreateSalesCategoryMutation($name: String!) {
    createSalesCategory(input: { name: $name }) {
      salesCategory {
        id
      }
    }
  }
`;

export const CREATE_COST_ITEM = gql`
  mutation CreateCostItemMutation($name: String!) {
    createCostItem(input: { name: $name }) {
      costItem {
        id
      }
    }
  }
`;

export const DELETE_COST_ITEM = gql`
  mutation DeleteCostItemMutation($id: ID!) {
    deleteCostItem(input: { id: $id }) {
      costItem {
        id
      }
    }
  }
`;

export const DELETE_SALES_CATEGORY = gql`
  mutation DelteSalesCategoryMutation($id: ID!) {
    deleteSalesCategory(input: { id: $id }) {
      salesCategory {
        id
      }
    }
  }
`;

export const DELETE_DEPARTMENT = gql`
  mutation DeleteDepartmentMutation($id: ID!) {
    deleteDept(input: { id: $id }) {
      department {
        id
      }
    }
  }
`;

export const DELETE_SALES_UNIT = gql`
  mutation DeleteSalesUnitMutation($id: ID!) {
    deleteSalesUnit(input: { id: $id }) {
      salesUnit {
        id
      }
    }
  }
`;

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployeeMutation($id: ID!) {
    deleteEmployee(input: { id: $id }) {
      employee {
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

// with photo
export const CREATE_SALES_UNIT = gql`
  mutation CreateSalesUnitMutation(
    $name: String!
    $unitPrice: String!
    $departments: [ID!]!
    $category: ID!
    $photo: Upload
  ) {
    createSalesUnit(
      input: {
        name: $name
        unitPrice: $unitPrice
        departments: $departments
        category: $category
        photo: $photo
      }
    ) {
      salesUnit {
        id
      }
    }
  }
`;

export const getUpdateSalesUnitMutation = (isPhotoEdited: boolean) => gql`
  mutation UpdateSalesUnitMutation(
    $id: ID!
    $name: String!
    $unitPrice: String!
    $departments: [ID!]!
    $category: ID!
    ${isPhotoEdited ? "$photo: Upload" : ""}
  ) {
    updateSalesUnit(
      input: {
        id: $id
        name: $name
        unitPrice: $unitPrice
        category: $category
        departments: $departments
        ${isPhotoEdited ? "photo: $photo" : ""}
      }
    ) {
      salesUnit {
        id
      }
    }
  }
`;

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployeeMutation(
    $firstName: String!
    $lastName: String!
    $furiganaFirstName: String!
    $furiganaLastName: String!
    $payment: String!
    $position: Int!
    $department: ID!
    $photo: Upload
  ) {
    createEmployee(
      input: {
        firstName: $firstName
        lastName: $lastName
        furiganaFirstName: $furiganaFirstName
        furiganaLastName: $furiganaLastName
        payment: $payment
        position: $position
        department: $department
        photo: $photo
      }
    ) {
      employee {
        id
      }
    }
  }
`;

export const getUpdateEmployeeMutation = (isPhotoEdited: boolean) => {
  return gql`
  mutation UpdateEmployeeMutation(
    $id: ID!
    $firstName: String!
    $lastName: String!
    $furiganaFirstName: String
    $furiganaLastName: String
    $payment: String!
    $position: Int!
    $department: ID!
    ${isPhotoEdited ? "$photo: Upload" : ""}
  ) {
    updateEmployee(
      input: {
        id: $id
        firstName: $firstName
        lastName: $lastName
        furiganaFirstName: $furiganaFirstName
        furiganaLastName: $furiganaLastName
        payment: $payment
        position: $position
        department: $department
        ${isPhotoEdited ? "photo: $photo" : ""}
      }
    ) {
      employee {
        id
      }
    }
  }
`;
};
