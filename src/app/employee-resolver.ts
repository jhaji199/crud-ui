import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { EmployeeService } from "./employee.service";
import { inject } from "@angular/core";
import { catchError, Observable, of, tap } from "rxjs";
import { Employee } from "./employee.model";

export const EmployeeResolver: ResolveFn<Employee> = 
    (route: ActivatedRouteSnapshot,
     state: RouterStateSnapshot,
     employeeService: EmployeeService = inject(EmployeeService)): Observable<Employee> => {
        
        const employeeId = route.paramMap.get("employeeId");

        if (employeeId) {
            console.log('Resolving employee with ID:', employeeId);
            return employeeService.getEmployee(Number(employeeId)).pipe(
                tap((data) => console.log('Resolved employee:', data)), // Debug log
                catchError((error) => {
                    console.error('Resolver error:', error);
                    return of({
                        employeeId: 0,
                        employeeName: 'Error',
                        employeeContactNumber: '',
                        employeeAddress: '',
                        employeeGender: '',
                        employeeDepartment: '',
                        employeeSkills: '',
                        countryId: 0,
                        stateId: 0,
                        countryName: '',
                        stateName: ''
                    } as Employee); // Return a fallback value on error
                })
            );
        } else {
            const defaultEmployee: Employee = {
                employeeId: 0,
                employeeName: '',
                employeeContactNumber: '',
                employeeAddress: '',
                employeeGender: '',
                employeeDepartment: '',
                employeeSkills: '',
                countryId: 0,
                stateId: 0,
                countryName: '',
                stateName: ''
            };
            console.log('No employeeId provided, returning default employee');
            return of(defaultEmployee);
        }
    };
