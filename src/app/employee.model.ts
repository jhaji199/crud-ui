export interface Employee {
    employeeId?: number;
    employeeName: string;
    employeeContactNumber: string;
    employeeAddress: string;
    employeeGender: string;
    employeeDepartment: string;
    employeeSkills: string;
    countryId: number;   // ID of the country
    stateId: number;     // ID of the state
    countryName?: string; // Optional property to hold country name (for display)
    stateName?: string;   // Optional property to hold state name (for display)
}